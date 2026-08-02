import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';
import Redis, { RedisOptions } from 'ioredis';
import { Pool } from 'pg';
import { envs } from 'src/config';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export interface ReniecQueryApiResponse {
    nroDocumento: string;
    nombre: string;
    primerApellido: string;
    segundoApellido: string;
    codVerificacion: string;
    idSexo: string;
    fechaNacimiento: string;
    foto: string;
    firma: string;
    departamento: string;
    provincia: string;
    distrito: string;
    domicilio: string;
    fechaIncripcion: string;
    fechaEmision: string;
    estadoCivil: string;
    edad: string;
    departamentoActual: string;
    provinciaActual: string;
    distritoActual: string;
    nombrePadre: string;
    nombreMadre: string;
    codigoUbigeo: string;
    esFallecido: string;
}

interface ReniecAuthResponse {
  codigo: number;
  mensaje: string;
  success: boolean;
  data: { usuario: string; token: string };
}

export interface ReniecServiceResponse {
  codigo: number;
  mensaje: string;
  success: boolean;
  data: ReniecQueryApiResponse;
}

@Injectable()
export class ReniecQueryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReniecQueryService.name);
  private redisClient: Redis;
  private pgPool: Pool;

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    const reniecUrl = String(envs.reniecDatabaseUrl);
    const safeUrl = reniecUrl.replace(/:\/\/[^@]+@/, '://***@');
    this.logger.log(`Connecting to RENIEC database: ${safeUrl}`);

    this.pgPool = new Pool({ connectionString: reniecUrl });
    this.pgPool.on('error', (err: Error) =>
      this.logger.error('Error pool RENIEC DB', err.message),
    );

    try {
      const client = await this.pgPool.connect();
      const result = await client.query<{ now: string }>('SELECT NOW() as now');
      client.release();
      this.logger.log(
        `RENIEC database connected successfully — server time: ${result.rows[0].now}`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`RENIEC database connection FAILED: ${msg}`);
    }

    const opts: RedisOptions = {
      host: String(envs.redisHost),
      port: Number(envs.redisPort),
      db: Number(envs.reniecRedisDb ?? 1),
      username: String(envs.redisUser),
      password: String(envs.redisPassword),
    };
    this.redisClient = new Redis(opts);

    this.redisClient.on('connect', () =>
      this.logger.log('Redis RENIEC conectado'),
    );
    this.redisClient.on('error', (err: Error) =>
      this.logger.error('Error Redis RENIEC', err.message),
    );
  }

  async onModuleDestroy() {
    await Promise.all([this.redisClient.quit(), this.pgPool.end()]);
  }

  private async getToken(): Promise<string> {
    const url = `${envs.reniecApiUrl}/Autentificacion/GetUsuarioLogin`;
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<ReniecAuthResponse>(
          url,
          { usuario: envs.reniecUser, password: envs.reniecPassword },
          { httpsAgent },
        ),
      );
      return data.data.token;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new InternalServerErrorException(
        'No se pudo autenticar en el servicio RENIEC',
        msg,
      );
    }
  }

  private async saveToDatabase(
    data: ReniecQueryApiResponse,
  ): Promise<void> {
    try {
      await this.pgPool.query(
        `INSERT INTO dni_records (
          nro_documento, nombre, primer_apellido, segundo_apellido,
          cod_verificacion, id_sexo, fecha_nacimiento,
          departamento, provincia, distrito, domicilio, fecha_incripcion,
          fecha_emision, estado_civil, edad, departamento_actual,
          provincia_actual, distrito_actual, nombre_padre, nombre_madre,
          codigo_ubigeo, es_fallecido
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
        [
          data.nroDocumento,
          data.nombre,
          data.primerApellido,
          data.segundoApellido,
          data.codVerificacion,
          data.idSexo,
          data.fechaNacimiento,
          data.departamento,
          data.provincia,
          data.distrito,
          data.domicilio,
          data.fechaIncripcion,
          data.fechaEmision,
          data.estadoCivil,
          data.edad,
          data.departamentoActual,
          data.provinciaActual,
          data.distritoActual,
          data.nombrePadre,
          data.nombreMadre,
          data.codigoUbigeo,
          data.esFallecido || null,
        ],
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const code = (err as { code?: string }).code;
      this.logger.error(
        `Error guardando DNI ${data.nroDocumento} en DB — code: ${code ?? 'N/A'} | msg: ${msg}`,
      );
    }
  }

  private async saveToCache(
    dni: string,
    response: ReniecQueryApiResponse,
  ): Promise<void> {
    try {
      await this.redisClient.set(
        `reniec:${dni}`,
        JSON.stringify(response),
        'EX',
        Number(envs.redisTtl ?? 86400),
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error guardando DNI ${dni} en Redis RENIEC: ${msg}`);
    }
  }

  async getDataReniec(dni: string): Promise<ReniecQueryApiResponse> {
    const cacheKey = `reniec:${dni}`;

    const cached = await this.redisClient
      .get(cacheKey)
      .catch((err: unknown) => {
        this.logger.warn(
          `No se pudo leer Redis RENIEC para DNI ${dni}: ${err instanceof Error ? err.message : String(err)}`,
        );
        return null;
      });

    if (cached) {
      this.logger.log(`DNI ${dni} servido desde cache Redis RENIEC`);
      const parsed = JSON.parse(cached);
      // Handle older cached items that might still be wrapped in ReniecServiceResponse
      return (parsed.data && parsed.success !== undefined) 
        ? parsed.data as ReniecQueryApiResponse 
        : parsed as ReniecQueryApiResponse;
    }

    const token = await this.getToken();
    const url = `${envs.reniecApiUrl}/ServicioReniec/GetServicioReniec`;
    this.logger.log(`Consultando DNI ${dni} → ${url}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<ReniecServiceResponse>(url, {
          params: { NroDocumento: dni },
          headers: { Authorization: `Bearer ${token}` },
          httpsAgent,
        }),
      );

      if (data && data.data) {
        await Promise.all([
          this.saveToDatabase(data.data),
          this.saveToCache(dni, data.data),
        ]);
        return data.data;
      }

      throw new InternalServerErrorException(`Respuesta inválida de RENIEC para el DNI ${dni}`);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: unknown };
      };
      const status = axiosErr?.response?.status;
      const body = axiosErr?.response?.data;
      const bodyStr =
        typeof body === 'string' ? body : JSON.stringify(body ?? {});
      this.logger.error(
        `Error consultando DNI ${dni} | status: ${status ?? 'N/A'} | body: ${bodyStr} | url: ${url}`,
      );
      throw new InternalServerErrorException(
        `No se pudo consultar el DNI ${dni} en RENIEC`,
      );
    }
  }
}
