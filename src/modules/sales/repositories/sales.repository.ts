import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateSaleRequestDto } from '../dtos/requests/create-sale.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationRequestDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SaleWhereInput = search
      ? {
          OR: [
            { documentNumber: { contains: search, mode: 'insensitive' } },
            { customer: { name: { contains: search, mode: 'insensitive' } } },
            { customer: { documentNumber: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          status: true,
          items: {
            include: {
              product: true,
            },
          },
          serviceOrder: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sale.count({ where }),
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
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        status: true,
        items: {
          include: {
            product: true,
          },
        },
        serviceOrder: true,
      },
    });
    if (!sale) throw new NotFoundException('Venta no encontrada');
    return sale;
  }

  async create(data: CreateSaleRequestDto) {
    // Validate customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) throw new NotFoundException('Cliente no encontrado');

    // Get active status
    const activeStatus = await this.prisma.status.findUnique({
      where: { name: 'Completado' },
    });
    const fallbackStatus =
      activeStatus || (await this.prisma.status.findUnique({ where: { name: 'Activo' } }));
    if (!fallbackStatus) throw new NotFoundException('Estado por defecto no encontrado');

    // Validate stock for product items
    for (const item of data.items) {
      if (item.type === 'Product' && item.productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) throw new NotFoundException(`Producto con ID ${item.productId} no encontrado`);
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
          );
        }
      }
    }

    // Calculate totals
    const calculatedTotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const calculatedSubtotal = calculatedTotal / 1.18;
    const calculatedTax = calculatedTotal - calculatedSubtotal;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Sale record
      const sale = await tx.sale.create({
        data: {
          customerId: data.customerId,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          origin: 'Direct',
          subtotal: parseFloat(calculatedSubtotal.toFixed(2)),
          tax: parseFloat(calculatedTax.toFixed(2)),
          total: parseFloat(calculatedTotal.toFixed(2)),
          statusId: fallbackStatus.id,
          items: {
            create: data.items.map((item) => ({
              type: item.type,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
              productId: item.productId || null,
            })),
          },
        },
        include: {
          customer: true,
          status: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 2. Decrement stock and create movements for product items
      for (const item of data.items) {
        if (item.type === 'Product' && item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          await tx.movement.create({
            data: {
              productId: item.productId,
              type: 'Out',
              quantity: item.quantity,
              reference: `Venta ${data.documentType}: ${data.documentNumber}`,
            },
          });
        }
      }

      return sale;
    });
  }
}
