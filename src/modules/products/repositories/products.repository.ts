import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateProductRequestDto } from '../dtos/requests/update-product.request.dto';
import { CreateProductRequestDto } from '../dtos/requests/create-product.request.dto';
import { Prisma } from '@prisma/client';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationRequestDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { type: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { status: true, category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
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
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { status: true, category: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(data: CreateProductRequestDto) {
    const activeStatus = await this.prisma.status.findUnique({ where: { name: 'Activo' } });
    if (!activeStatus) throw new NotFoundException('Estado Activo no encontrado');

    if (data.categoryId) {
        const category = await this.prisma.category.findUnique({ where: { id: data.categoryId } });
        if (!category) throw new NotFoundException('Categoría no encontrada');
    }

    return this.prisma.product.create({
      data: {
        name: data.name,
        type: data.type,
        purchasePrice: data.purchasePrice,
        salePrice: data.salePrice,
        stock: data.stock,
        categoryId: data.categoryId,
        statusId: activeStatus.id,
      },
      include: { status: true, category: true },
    });
  }

  async update(id: string, data: UpdateProductRequestDto) {
    await this.findById(id); // Check existence
    
    // Si se pasa categoryId, verificar que la categoría exista
    if (data.categoryId) {
        const category = await this.prisma.category.findUnique({ where: { id: data.categoryId } });
        if (!category) throw new NotFoundException('Categoría no encontrada');
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: { status: true, category: true },
    });
  }

  async patchStatus(id: string, statusName: string) {
    await this.findById(id); // Check existence
    const status = await this.prisma.status.findUnique({ where: { name: statusName } });
    if (!status) throw new NotFoundException(`Estado ${statusName} no encontrado`);

    return this.prisma.product.update({
      where: { id },
      data: { statusId: status.id },
      include: { status: true, category: true },
    });
  }
}
