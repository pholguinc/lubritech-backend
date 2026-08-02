import { Injectable } from '@nestjs/common';
import { ServiceOrdersRepository } from '../repositories/service-orders.repository';
import { CreateServiceOrderRequestDto } from '../dtos/requests/create-service-order.request.dto';
import { UpdateServiceOrderRequestDto } from '../dtos/requests/update-service-order.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';

@Injectable()
export class ServiceOrdersService {
  constructor(private readonly serviceOrdersRepository: ServiceOrdersRepository) {}

  findAll(query: PaginationRequestDto) {
    return this.serviceOrdersRepository.findAll(query);
  }

  findById(id: string) {
    return this.serviceOrdersRepository.findById(id);
  }

  create(data: CreateServiceOrderRequestDto) {
    return this.serviceOrdersRepository.create(data);
  }

  update(id: string, data: UpdateServiceOrderRequestDto) {
    return this.serviceOrdersRepository.update(id, data);
  }
}

