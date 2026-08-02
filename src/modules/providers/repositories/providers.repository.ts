import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateProviderRequestDto } from '../dtos/requests/create-provider.request.dto';
import { UpdateProviderRequestDto } from '../dtos/requests/update-provider.request.dto';
import { Prisma } from '@prisma/client';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { StatusEnum } from 'src/core/enums/status.enum';

@Injectable()
export class ProvidersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationRequestDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = search
      ? {
          OR: [
            { company: { contains: search, mode: 'insensitive' } },
            { documentNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        include: { status: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return { 
      items, 
      meta: {
        total, 
        page, 
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string) {
    const provider = await this.prisma.supplier.findUnique({
      where: { id },
      include: { status: true },
    });
    if (!provider) throw new NotFoundException('Proveedor no encontrado');
    return provider;
  }

  async create(data: CreateProviderRequestDto) {
    const existing = await this.prisma.supplier.findUnique({ where: { documentNumber: data.documentNumber } });
    if (existing) {
      throw new ConflictException('Ya existe un proveedor con este documento');
    }

    const activeStatus = await this.prisma.status.findUnique({ where: { name: StatusEnum.ACTIVO } });
    if (!activeStatus) throw new NotFoundException('Estado Activo no encontrado');

    return this.prisma.supplier.create({
      data: {
        company: data.company,
        documentType: data.documentType || 'RUC',
        documentNumber: data.documentNumber,
        contact: data.contact,
        phone: data.phone,
        email: data.email,
        statusId: activeStatus.id,
      },
      include: { status: true },
    });
  }

  async update(id: string, data: UpdateProviderRequestDto) {
    await this.findById(id); // Verifica existencia

    if (data.documentNumber) {
      const existing = await this.prisma.supplier.findUnique({ where: { documentNumber: data.documentNumber } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe otro proveedor con este documento');
      }
    }

    return this.prisma.supplier.update({
      where: { id },
      data,
      include: { status: true },
    });
  }

  async patchStatus(id: string, statusName: string) {
    await this.findById(id); // Verifica existencia
    const status = await this.prisma.status.findUnique({ where: { name: statusName } });
    if (!status) throw new NotFoundException(`Estado ${statusName} no encontrado`);

    return this.prisma.supplier.update({
      where: { id },
      data: { statusId: status.id },
      include: { status: true },
    });
  }
}
