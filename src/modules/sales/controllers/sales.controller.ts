import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { SalesService } from '../services/sales.service';
import { CreateSaleRequestDto } from '../dtos/requests/create-sale.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';
import { HandleServiceError } from 'src/core/decorators/handle-service-error.decorator';

@ApiTags('💰 Ventas')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar ventas con paginación' })
  @ResponseMessage('Ventas obtenidas exitosamente')
  @HandleServiceError('Error al listar las ventas')
  findAll(@Query() query: PaginationRequestDto) {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una venta por ID' })
  @ResponseMessage('Venta obtenida exitosamente')
  @HandleServiceError('Error al obtener la venta')
  findById(@Param('id') id: string) {
    return this.salesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una nueva venta directa' })
  @ResponseMessage('Venta registrada exitosamente')
  @HandleServiceError('Error al registrar la venta')
  create(@Body() data: CreateSaleRequestDto) {
    return this.salesService.create(data);
  }

  @Get(':id/ticket')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generar PDF del ticket de venta' })
  @HandleServiceError('Error al generar el ticket')
  async getTicketPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.salesService.generateTicketPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="ticket-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
