import { Injectable } from '@nestjs/common';
import { ProductsRepository } from '../repositories/products.repository';
import { UpdateProductRequestDto } from '../dtos/requests/update-product.request.dto';
import { CreateProductRequestDto } from '../dtos/requests/create-product.request.dto';
import { PatchProductStatusRequestDto } from '../dtos/requests/patch-product-status.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';

@Injectable()
export class ProductService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  findAll(query: PaginationRequestDto) {
    return this.productsRepository.findAll(query);
  }

  findById(id: string) {
    return this.productsRepository.findById(id);
  }

  create(data: CreateProductRequestDto) {
    return this.productsRepository.create(data);
  }

  update(id: string, data: UpdateProductRequestDto) {
    return this.productsRepository.update(id, data);
  }

  patchStatus(id: string, data: PatchProductStatusRequestDto) {
    return this.productsRepository.patchStatus(id, data.statusName);
  }
}
