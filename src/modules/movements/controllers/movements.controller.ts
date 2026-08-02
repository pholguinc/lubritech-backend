import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { MovementsService } from '../services/movements.service';
import { CreateMovementRequestDto } from '../dtos/requests/create-movement.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';
import { HandleServiceError } from 'src/core/decorators/handle-service-error.decorator';

@ApiTags('📦 Movimientos (Kardex)')
@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get('/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar movimientos de inventario con paginación' })
  @ResponseMessage('Movimientos obtenidos exitosamente')
  @HandleServiceError('Error al listar los movimientos')
  findAll(@Query() query: PaginationRequestDto) {
    return this.movementsService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo movimiento manual (Ajuste/Devolución)' })
  @ResponseMessage('Movimiento registrado exitosamente')
  @HandleServiceError('Error al registrar el movimiento')
  create(@Body() data: CreateMovementRequestDto) {
    return this.movementsService.create(data);
  }
}
