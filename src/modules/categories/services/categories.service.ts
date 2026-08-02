import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from '../repositories/categories.repository';
import { CreateCategoryRequestDto } from '../dtos/requests/create-category.request.dto';
import { UpdateCategoryRequestDto } from '../dtos/requests/update-category.request.dto';
import { PatchCategoryStatusRequestDto } from '../dtos/requests/patch-category-status.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  findAll(query: PaginationRequestDto) {
    return this.categoriesRepository.findAll(query);
  }

  findById(id: string) {
    return this.categoriesRepository.findById(id);
  }

  create(data: CreateCategoryRequestDto) {
    return this.categoriesRepository.create(data);
  }

  update(id: string, data: UpdateCategoryRequestDto) {
    return this.categoriesRepository.update(id, data);
  }

  patchStatus(id: string, data: PatchCategoryStatusRequestDto) {
    return this.categoriesRepository.patchStatus(id, data.statusName);
  }
}
