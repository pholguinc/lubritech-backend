import { Controller, Get, Post, Body, Param, Patch, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryRequestDto } from '../dtos/requests/create-category.request.dto';
import { UpdateCategoryRequestDto } from '../dtos/requests/update-category.request.dto';
import { PatchCategoryStatusRequestDto } from '../dtos/requests/patch-category-status.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';
import { HandleServiceError } from 'src/core/decorators/handle-service-error.decorator';

@ApiTags('🏷️ Categorías')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar categorías con paginación' })
  @ResponseMessage('Categorías obtenidas exitosamente')
  @HandleServiceError('Error al listar categorías')
  findAll(@Query() query: PaginationRequestDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ResponseMessage('Categoría obtenida exitosamente')
  @HandleServiceError('Error al obtener la categoría')
  findById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva categoría' })
  @ResponseMessage('Categoría creada exitosamente')
  @HandleServiceError('Error al crear la categoría')
  create(@Body() data: CreateCategoryRequestDto) {
    return this.categoriesService.create(data);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una categoría' })
  @ResponseMessage('Categoría actualizada exitosamente')
  @HandleServiceError('Error al actualizar la categoría')
  update(@Param('id') id: string, @Body() data: UpdateCategoryRequestDto) {
    return this.categoriesService.update(id, data);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar el estado de una categoría' })
  @ResponseMessage('Estado de la categoría actualizado exitosamente')
  @HandleServiceError('Error al actualizar el estado de la categoría')
  patchStatus(@Param('id') id: string, @Body() data: PatchCategoryStatusRequestDto) {
    return this.categoriesService.patchStatus(id, data);
  }
}
