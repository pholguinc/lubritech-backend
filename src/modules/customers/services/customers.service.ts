import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CustomersRepository } from '../repositories/customers.repository';
import { CreateCustomerRequestDto } from '../dtos/requests/create-customer.request.dto';
import { UpdateCustomerRequestDto } from '../dtos/requests/update-customer.request.dto';
import { UpdateCustomerStatusRequestDto } from '../dtos/requests/update-customer-status.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { PaginationResponseDto } from 'src/core/dtos/pagination/pagination.response.dto';
import { CustomerResponseDto } from '../dtos/responses/customer.response.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { StatusEnum } from 'src/core/enums/status.enum';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateCustomerRequestDto): Promise<CustomerResponseDto> {
    const existing = await this.customersRepository.findByDocument(dto.documentNumber);
    if (existing) {
      throw new BadRequestException('Ya existe un cliente con este número de documento');
    }

    const activeStatus = await this.prisma.status.findUnique({ where: { name: StatusEnum.ACTIVO } });
    if (!activeStatus) {
      throw new BadRequestException('Estado "Activo" no encontrado en la base de datos');
    }

    const { code: newCode } = await this.getNextCode();

    const customer = await this.customersRepository.create({
      ...dto,
      code: newCode,
      statusId: activeStatus.id,
    });

    return customer as CustomerResponseDto;
  }

  async findAll(query: PaginationRequestDto): Promise<PaginationResponseDto<CustomerResponseDto>> {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { documentNumber: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(query.status && {
        status: {
          name: query.status
        }
      }),
    };

    const [items, totalItems] = await this.customersRepository.findAll(skip, limit, where);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: items as CustomerResponseDto[],
      meta: {
        page,
        totalPages,
        totalItems,
        lastpage: totalPages,
      },
    };
  }

  async findById(id: string): Promise<CustomerResponseDto> {
    const customer = await this.customersRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return customer as CustomerResponseDto;
  }

  async update(id: string, dto: UpdateCustomerRequestDto): Promise<CustomerResponseDto> {
    const customer = await this.customersRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    if (dto.documentNumber && dto.documentNumber !== customer.documentNumber) {
      const existing = await this.customersRepository.findByDocument(dto.documentNumber);
      if (existing) {
        throw new BadRequestException('Ya existe un cliente con este número de documento');
      }
    }

    const updated = await this.customersRepository.update(id, dto);
    return updated as CustomerResponseDto;
  }

  async updateStatus(id: string, dto: UpdateCustomerStatusRequestDto): Promise<CustomerResponseDto> {
    const customer = await this.customersRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    const targetStatus = await this.prisma.status.findUnique({ where: { name: dto.statusName } });
    if (!targetStatus) {
      throw new BadRequestException(`Estado "${dto.statusName}" no encontrado en la base de datos`);
    }

    const updated = await this.customersRepository.update(id, { statusId: targetStatus.id });
    return updated as CustomerResponseDto;
  }

  async getNextCode(): Promise<{ code: string }> {
    const lastCode = await this.customersRepository.findLastCode();
    let newCode = 'CLI0000001';
    if (lastCode && lastCode.startsWith('CLI')) {
      const numberPart = parseInt(lastCode.replace('CLI', ''), 10);
      if (!isNaN(numberPart)) {
        newCode = `CLI${String(numberPart + 1).padStart(7, '0')}`;
      }
    }
    return { code: newCode };
  }
}
