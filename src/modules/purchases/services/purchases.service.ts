import { Injectable } from '@nestjs/common';
import { PurchasesRepository } from '../repositories/purchases.repository';
import { CreatePurchaseRequestDto } from '../dtos/requests/create-purchase.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';

@Injectable()
export class PurchasesService {
  constructor(private readonly purchasesRepository: PurchasesRepository) {}

  findAll(query: PaginationRequestDto) {
    return this.purchasesRepository.findAll(query);
  }

  findById(id: string) {
    return this.purchasesRepository.findById(id);
  }

  create(data: CreatePurchaseRequestDto) {
    return this.purchasesRepository.create(data);
  }
}
