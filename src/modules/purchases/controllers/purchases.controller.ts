import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PurchasesService } from '../services/purchases.service';
import { CreatePurchaseRequestDto } from '../dtos/requests/create-purchase.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';
import { HandleServiceError } from 'src/core/decorators/handle-service-error.decorator';

@ApiTags('🛒 Compras')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get('/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar compras con paginación' })
  @ResponseMessage('Compras obtenidas exitosamente')
  @HandleServiceError('Error al listar las compras')
  findAll(@Query() query: PaginationRequestDto) {
    return this.purchasesService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una compra por ID' })
  @ResponseMessage('Compra obtenida exitosamente')
  @HandleServiceError('Error al obtener la compra')
  findById(@Param('id') id: string) {
    return this.purchasesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una nueva compra' })
  @ResponseMessage('Compra registrada exitosamente')
  @HandleServiceError('Error al registrar la compra')
  create(@Body() data: CreatePurchaseRequestDto) {
    return this.purchasesService.create(data);
  }
}
