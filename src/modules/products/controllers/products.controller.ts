import { Controller, Get, Post, Body, Param, Patch, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductService } from '../services/products.service';
import { UpdateProductRequestDto } from '../dtos/requests/update-product.request.dto';
import { CreateProductRequestDto } from '../dtos/requests/create-product.request.dto';
import { PatchProductStatusRequestDto } from '../dtos/requests/patch-product-status.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';
import { HandleServiceError } from 'src/core/decorators/handle-service-error.decorator';

@ApiTags('📦 Productos')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get('/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar productos con paginación' })
  @ResponseMessage('Productos obtenidos exitosamente')
  @HandleServiceError('Error al listar productos')
  findAll(@Query() query: PaginationRequestDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ResponseMessage('Producto obtenido exitosamente')
  @HandleServiceError('Error al obtener el producto')
  findById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ResponseMessage('Producto creado exitosamente')
  @HandleServiceError('Error al crear el producto')
  create(@Body() data: CreateProductRequestDto) {
    return this.productService.create(data);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ResponseMessage('Producto actualizado exitosamente')
  @HandleServiceError('Error al actualizar el producto')
  update(@Param('id') id: string, @Body() data: UpdateProductRequestDto) {
    return this.productService.update(id, data);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar el estado de un producto' })
  @ResponseMessage('Estado del producto actualizado exitosamente')
  @HandleServiceError('Error al actualizar el estado del producto')
  patchStatus(@Param('id') id: string, @Body() data: PatchProductStatusRequestDto) {
    return this.productService.patchStatus(id, data);
  }
}
