import { Injectable } from '@nestjs/common';
import { MovementsRepository } from '../repositories/movements.repository';
import { CreateMovementRequestDto } from '../dtos/requests/create-movement.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';

@Injectable()
export class MovementsService {
  constructor(private readonly movementsRepository: MovementsRepository) {}

  findAll(query: PaginationRequestDto) {
    return this.movementsRepository.findAll(query);
  }

  create(data: CreateMovementRequestDto) {
    return this.movementsRepository.create(data);
  }
}
