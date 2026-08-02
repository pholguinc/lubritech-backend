import {
  Controller,
  Get,
  Param,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags, ApiHeader } from '@nestjs/swagger';
import {
  ReniecQueryApiResponse,
  ReniecQueryService,
} from '../services/reniec-query.service';
import {
  SunatQueryApiResponse,
  SunatQueryService,
} from '../services/sunat-query.service';
import { UbigeoQueryService, UbigeoApiResponse } from '../services/ubigeos-query.service';
import { HandleServiceError } from 'src/core/decorators/handle-service-error.decorator';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';

@ApiTags('Consultas externas')
@Controller('external-query')
export class ExternalQueryController {
  constructor(
    private readonly sunatQueryService: SunatQueryService,
    private readonly reniecQueryService: ReniecQueryService,
    private readonly ubigeoQueryService: UbigeoQueryService,
  ) {}

  @Get('/ruc/:ruc')
  @ApiOperation({ summary: 'Consultar información de un RUC en SUNAT' })
  @ApiParam({
    name: 'ruc',
    description: 'RUC de 11 dígitos',
    example: '20490469797',
  })
  getRucStatus(
    @Param('ruc') ruc: string,
  ): Promise<SunatQueryApiResponse> {
    return this.sunatQueryService.getRucStatus(ruc);
  }

  @Get('/dni/:dni')
  @ApiOperation({ summary: 'Consultar información de un DNI en RENIEC' })
  @ApiParam({
    name: 'dni',
    description: 'DNI de 8 dígitos',
    example: '12345678',
  })
  @ResponseMessage('DNI consultado correctamente')
  @HandleServiceError('Error al consultar DNI')
  getDNI(@Param('dni') dni: string): Promise<ReniecQueryApiResponse> {
    return this.reniecQueryService.getDataReniec(dni);
  }

  @Get('/exchange-rate')
  @ApiOperation({ summary: 'Consultar el tipo de cambio actual de SUNAT' })
  getExchangeRate() {
    return this.sunatQueryService.getExchangeRate();
  }

  @Get('/ubigeos')
  @ApiOperation({ summary: 'Consultar la lista maestra de ubigeos' })
  @ResponseMessage('Ubigeos obtenidos correctamente')
  @HandleServiceError('Error al obtener la lista de ubigeos')
  getUbigeos(): Promise<UbigeoApiResponse[]> {
    return this.ubigeoQueryService.getAllUbigeos();
  }
}
