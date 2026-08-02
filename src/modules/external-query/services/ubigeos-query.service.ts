import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { envs } from 'src/config';

export interface UbigeoApiResponse {
  id: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

@Injectable()
export class UbigeoQueryService {
  private readonly logger = new Logger(UbigeoQueryService.name);

  constructor(private readonly httpService: HttpService) {}

  async getAllUbigeos(): Promise<UbigeoApiResponse[]> {
    const url = `${envs.apiUrlUbigeos}/ubigeos`;
    this.logger.log(`Consultando ubigeos → ${url}`);

    try {
      // Usamos responseType json y asumimos que devuelve un array de UbigeoApiResponse
      const { data } = await firstValueFrom(
        this.httpService.get<UbigeoApiResponse[]>(url),
      );
      
      // Si la API lo envuelve en algo como { data: [...] }, extraemos el array
      if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        return (data as any).data;
      }
      
      if (Array.isArray(data)) {
        return data;
      }

      this.logger.warn(`El formato de respuesta de ubigeos no es el esperado. Se retorna array vacío.`);
      return [];
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: unknown } };
      const status = axiosErr?.response?.status;
      const body = axiosErr?.response?.data;
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body ?? {});
      
      this.logger.error(
        `Error consultando ubigeos | status: ${status ?? 'N/A'} | body: ${bodyStr} | url: ${url}`,
      );
      throw new InternalServerErrorException('No se pudo obtener la lista de ubigeos');
    }
  }
}
