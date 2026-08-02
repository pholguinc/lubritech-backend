import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ServiceOrdersService } from '../services/service-orders.service';
import { CreateServiceOrderRequestDto } from '../dtos/requests/create-service-order.request.dto';
import { UpdateServiceOrderRequestDto } from '../dtos/requests/update-service-order.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';
import { HandleServiceError } from 'src/core/decorators/handle-service-error.decorator';

@ApiTags('🔧 Órdenes de Servicio')
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Get('/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar órdenes de servicio con paginación' })
  @ResponseMessage('Órdenes de servicio obtenidas exitosamente')
  @HandleServiceError('Error al listar las órdenes de servicio')
  findAll(@Query() query: PaginationRequestDto) {
    return this.serviceOrdersService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una orden de servicio por ID' })
  @ResponseMessage('Orden de servicio obtenida exitosamente')
  @HandleServiceError('Error al obtener la orden de servicio')
  findById(@Param('id') id: string) {
    return this.serviceOrdersService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una nueva orden de servicio' })
  @ResponseMessage('Orden de servicio registrada exitosamente')
  @HandleServiceError('Error al registrar la orden de servicio')
  create(@Body() data: CreateServiceOrderRequestDto) {
    return this.serviceOrdersService.create(data);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una orden de servicio' })
  @ResponseMessage('Orden de servicio actualizada exitosamente')
  @HandleServiceError('Error al actualizar la orden de servicio')
  update(@Param('id') id: string, @Body() data: UpdateServiceOrderRequestDto) {
    return this.serviceOrdersService.update(id, data);
  }
}

