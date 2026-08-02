import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateMovementRequestDto } from '../dtos/requests/create-movement.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { MovementType } from '../enums/movement-type.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class MovementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationRequestDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MovementWhereInput = search
      ? {
          OR: [
            { reference: { contains: search, mode: 'insensitive' } },
            { product: { name: { contains: search, mode: 'insensitive' } } },
            { type: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.movement.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.movement.count({ where }),
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

  async create(data: CreateMovementRequestDto) {
    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    // Handle stock adjustment logic based on movement type
    const isIncrement = data.type === MovementType.IN || data.type === MovementType.RETURN;
    const isDecrement = data.type === MovementType.OUT || data.type === MovementType.CONSUMPTION;

    if (isDecrement && product.stock < data.quantity) {
      throw new BadRequestException(
        `Stock insuficiente para realizar salida. Stock disponible: ${product.stock}, solicitado: ${data.quantity}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create movement record
      const movement = await tx.movement.create({
        data: {
          productId: data.productId,
          type: data.type,
          quantity: data.quantity,
          reference: data.reference || null,
        },
        include: {
          product: true,
        },
      });

      // 2. Update product stock (only if type affects sellable stock)
      if (isIncrement || isDecrement) {
        await tx.product.update({
          where: { id: data.productId },
          data: {
            stock: isIncrement
              ? { increment: data.quantity }
              : { decrement: data.quantity },
          },
        });
      }

      return movement;
    });
  }
}
