import { Injectable } from '@nestjs/common';
import { ProvidersRepository } from '../repositories/providers.repository';
import { CreateProviderRequestDto } from '../dtos/requests/create-provider.request.dto';
import { UpdateProviderRequestDto } from '../dtos/requests/update-provider.request.dto';
import { PatchProviderStatusRequestDto } from '../dtos/requests/patch-provider-status.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';

@Injectable()
export class ProviderService {
  constructor(private readonly providersRepository: ProvidersRepository) {}

  findAll(query: PaginationRequestDto) {
    return this.providersRepository.findAll(query);
  }

  findById(id: string) {
    return this.providersRepository.findById(id);
  }

  create(data: CreateProviderRequestDto) {
    return this.providersRepository.create(data);
  }

  update(id: string, data: UpdateProviderRequestDto) {
    return this.providersRepository.update(id, data);
  }

  patchStatus(id: string, data: PatchProviderStatusRequestDto) {
    return this.providersRepository.patchStatus(id, data.statusName);
  }
}
