import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreatePurchaseRequestDto } from '../dtos/requests/create-purchase.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchasesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationRequestDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseWhereInput = search
      ? {
          OR: [
            { document: { contains: search, mode: 'insensitive' } },
            { supplier: { company: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        skip,
        take: limit,
        include: {
          supplier: true,
          status: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchase.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        status: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!purchase) throw new NotFoundException('Compra no encontrada');
    return purchase;
  }

  async create(data: CreatePurchaseRequestDto) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');

    const completedStatus = await this.prisma.status.findUnique({
      where: { name: 'Completado' },
    });
    const fallbackStatus = completedStatus || (await this.prisma.status.findUnique({ where: { name: 'Activo' } }));
    if (!fallbackStatus) throw new NotFoundException('Estado por defecto no encontrado');

    const calculatedTotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Purchase record
      const purchase = await tx.purchase.create({
        data: {
          supplierId: data.supplierId,
          document: data.document,
          total: calculatedTotal,
          statusId: fallbackStatus.id,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          supplier: true,
          status: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 2. Update stock and purchasePrice for each product, and record movement
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            purchasePrice: item.unitPrice,
          },
        });

        await tx.movement.create({
          data: {
            productId: item.productId,
            type: 'In',
            quantity: item.quantity,
            reference: `Compra Doc: ${data.document}`,
          },
        });
      }

      return purchase;
    });
  }
}
