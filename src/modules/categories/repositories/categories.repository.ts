import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateCategoryRequestDto } from '../dtos/requests/create-category.request.dto';
import { UpdateCategoryRequestDto } from '../dtos/requests/update-category.request.dto';
import { Prisma } from '@prisma/client';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationRequestDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        include: { status: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.category.count({ where }),
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
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { status: true },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async create(data: CreateCategoryRequestDto) {
    const activeStatus = await this.prisma.status.findUnique({ where: { name: 'Activo' } });
    if (!activeStatus) throw new NotFoundException('Estado Activo no encontrado');

    return this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        statusId: activeStatus.id,
      },
      include: { status: true },
    });
  }

  async update(id: string, data: UpdateCategoryRequestDto) {
    await this.findById(id); // Check existence
    return this.prisma.category.update({
      where: { id },
      data,
      include: { status: true },
    });
  }

  async patchStatus(id: string, statusName: string) {
    await this.findById(id); // Check existence
    const status = await this.prisma.status.findUnique({ where: { name: statusName } });
    if (!status) throw new NotFoundException(`Estado ${statusName} no encontrado`);

    return this.prisma.category.update({
      where: { id },
      data: { statusId: status.id },
      include: { status: true },
    });
  }
}
