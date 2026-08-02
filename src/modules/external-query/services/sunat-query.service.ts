import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { envs } from 'src/config';

export interface SunatQueryApiResponse {
  numero_ruc: string;
  razon_social: string;
  tipo_contribuyente: string;
  nombre_comercial: string;
  fecha_inscripcion: string;
  fecha_inicio_actividades: string;
  estado: string;
  condicion: string;
  domicilio_fiscal: string;
  sistema_emision_comprobante: string;
  actividad_comercio_exterior: string;
  sistema_contabilidad: string;
  actividad_principal: string;
  actividad_secundaria_1: string;
  actividad_secundaria_2: string;
  emisor_electronico_desde: string;
  afiliado_ple_desde: string;
  fecha_consulta: string;
  comprobantes_pago: string[];
  comprobantes_electronicos: string[];
  sistemas_emision_electronica: string[];
  padrones: string[];
  info_historica: {
    razones_sociales: string[];
    condiciones: {
      condicion: string;
      fecha_desde: string;
      fecha_hasta: string;
    }[];
    domicilios: string[];
    fecha_actualizacion: string;
  };
  trabajadores: {
    cantidad_trabajadores: number;
    cantidad_prestadores: number;
    cantidad_pensionistas: number;
    periodo: string;
    fecha_actualizacion: string;
  };
  reactiva_peru: {
    tiene_deuda_mayor_1uit: boolean;
    fecha_actualizacion: string;
    decreto: string;
  };
  establecimientos_anexos: {
    establecimientos: unknown[];
    fecha_actualizacion: string;
  };
  deuda_coactiva: {
    tiene_deuda: boolean;
    mensaje: string;
  };
  actas_probatorias: {
    actas: unknown[];
    fecha_actualizacion: string;
  };
  garantia_covid: {
    tiene_deuda_mayor_1uit: boolean;
    fecha_actualizacion: string;
    ley: string;
  };
  omisiones_tributarias: {
    tiene_omisiones: boolean;
    omisiones: unknown[];
    mensaje: string;
    fecha_actualizacion: string;
  };
  comprobantes_fisicos: {
    facturas_autorizadas: unknown[];
    facturas_baja_canceladas: unknown[];
    fecha_actualizacion: string;
  };
  representantes_legales: {
    representantes: unknown[];
  };
}

export interface SunatExchangeRateResponse {
  fecha: string;
  compra: number;
  venta: number;
}

@Injectable()
export class SunatQueryService {
  private readonly logger = new Logger(SunatQueryService.name);

  constructor(private readonly httpService: HttpService) {}

  private sanitizeStrings(obj: unknown): void {
    if (obj === null || typeof obj !== 'object') return;
    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const val = record[key];
      if (typeof val === 'string') {
        record[key] = val.replace(/"/g, '').trim();
      } else if (typeof val === 'object') {
        this.sanitizeStrings(val);
      }
    }
  }

  async getRucStatus(
    ruc: string,
  ): Promise<SunatQueryApiResponse> {
    const url = `${envs.sunatQueryApiUrl}/search/${ruc}`;
    this.logger.log(`Consultando RUC ${ruc} → ${url}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<SunatQueryApiResponse>(url, {
          headers: { 'X-API-Key': envs.sunatApiKey },
        }),
      );
      this.sanitizeStrings(data);
      this.logger.log(
        `RUC ${ruc} → respuesta sanitizada: ${JSON.stringify(data, null, 2)}`,
      );
      this.logger.log(
        `RUC ${ruc} → estado: ${data.estado}, condición: ${data.condicion}`,
      );
      return data;
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: unknown };
      };
      const status = axiosErr?.response?.status;
      const body = axiosErr?.response?.data;
      const bodyStr =
        typeof body === 'string' ? body : JSON.stringify(body ?? {});
      this.logger.error(
        `Error consultando RUC ${ruc} | status: ${status ?? 'N/A'} | body: ${bodyStr} | url: ${url}`,
      );
      throw new InternalServerErrorException(
        `No se pudo consultar el RUC ${ruc} en SUNAT`,
      );
    }
  }

  async getExchangeRate(): Promise<SunatExchangeRateResponse> {
    const url = 'https://www.sunat.gob.pe/a/txt/tipoCambio.txt';
    this.logger.log(`Consultando Tipo de Cambio SUNAT → ${url}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<string>(url, { responseType: 'text' })
      );
      
      // La respuesta viene en formato "DD/MM/YYYY|COMPRA|VENTA|"
      // Ejemplo: "04/07/2026|3.392|3.403|"
      const parts = data.split('|');
      
      if (parts.length >= 3) {
        return {
          fecha: parts[0].trim(),
          compra: parseFloat(parts[1].trim()),
          venta: parseFloat(parts[2].trim()),
        };
      }

      throw new Error('El formato de la respuesta no es válido');
    } catch (error) {
      this.logger.error(`Error consultando Tipo de Cambio SUNAT: ${error instanceof Error ? error.message : error}`);
      throw new InternalServerErrorException('No se pudo obtener el tipo de cambio de SUNAT');
    }
  }
}
