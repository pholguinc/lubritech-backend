import { Controller, Get, Post, Body, Param, Patch, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ProviderService } from '../services/providers.service';
import { CreateProviderRequestDto } from '../dtos/requests/create-provider.request.dto';
import { UpdateProviderRequestDto } from '../dtos/requests/update-provider.request.dto';
import { PatchProviderStatusRequestDto } from '../dtos/requests/patch-provider-status.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';
import { HandleServiceError } from 'src/core/decorators/handle-service-error.decorator';

@ApiTags('🚚 Proveedores')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providerService: ProviderService) {}

  @Get('/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar proveedores con paginación' })
  @ResponseMessage('Proveedores obtenidos exitosamente')
  @HandleServiceError('Error al listar proveedores')
  findAll(@Query() query: PaginationRequestDto) {
    return this.providerService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ResponseMessage('Proveedor obtenido exitosamente')
  @HandleServiceError('Error al obtener el proveedor')
  findById(@Param('id') id: string) {
    return this.providerService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  @ResponseMessage('Proveedor creado exitosamente')
  @HandleServiceError('Error al crear el proveedor')
  create(@Body() data: CreateProviderRequestDto) {
    return this.providerService.create(data);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un proveedor' })
  @ResponseMessage('Proveedor actualizado exitosamente')
  @HandleServiceError('Error al actualizar el proveedor')
  update(@Param('id') id: string, @Body() data: UpdateProviderRequestDto) {
    return this.providerService.update(id, data);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar el estado de un proveedor' })
  @ResponseMessage('Estado del proveedor actualizado exitosamente')
  @HandleServiceError('Error al actualizar el estado del proveedor')
  patchStatus(@Param('id') id: string, @Body() data: PatchProviderStatusRequestDto) {
    return this.providerService.patchStatus(id, data);
  }
}
