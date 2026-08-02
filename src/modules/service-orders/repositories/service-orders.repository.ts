import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateServiceOrderRequestDto } from '../dtos/requests/create-service-order.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServiceOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationRequestDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceOrderWhereInput = search
      ? {
          OR: [
            { plate: { contains: search, mode: 'insensitive' } },
            { vehicleModel: { contains: search, mode: 'insensitive' } },
            { customer: { name: { contains: search, mode: 'insensitive' } } },
            { customer: { documentNumber: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.serviceOrder.findMany({
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
          sale: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.serviceOrder.count({ where }),
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
    const serviceOrder = await this.prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        status: true,
        items: {
          include: {
            product: true,
          },
        },
        sale: true,
      },
    });
    if (!serviceOrder) throw new NotFoundException('Orden de servicio no encontrada');
    return serviceOrder;
  }

  async create(data: CreateServiceOrderRequestDto) {
    // Validate customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) throw new NotFoundException('Cliente no encontrado');

    // Get status
    const activeStatus = await this.prisma.status.findUnique({
      where: { name: 'Activo' },
    });
    if (!activeStatus) throw new NotFoundException('Estado por defecto no encontrado');

    const completedStatus = await this.prisma.status.findUnique({
      where: { name: 'Completado' },
    });

    // Validate stock for product items if order is being completed
    const isCompleted = data.orderStatus === 'Completado';
    if (isCompleted) {
      for (const item of data.items) {
        if (item.type === 'Product' && item.productId) {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
          });
          if (!product)
            throw new NotFoundException(`Producto con ID ${item.productId} no encontrado`);
          if (product.stock < item.quantity) {
            throw new BadRequestException(
              `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
            );
          }
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
      // 1. Create ServiceOrder record
      const serviceOrder = await tx.serviceOrder.create({
        data: {
          customerId: data.customerId,
          plate: data.plate,
          vehicleModel: data.vehicleModel,
          mileage: data.mileage,
          notes: data.notes || null,
          orderStatus: data.orderStatus,
          total: parseFloat(calculatedTotal.toFixed(2)),
          statusId: activeStatus.id,
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

      // 2. If completed, decrement stock, create movements, and auto-generate Sale
      if (isCompleted) {
        // Decrement stock for product items
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
                type: 'Consumption',
                quantity: item.quantity,
                reference: `Servicio Placa: ${data.plate} - ${data.vehicleModel}`,
              },
            });
          }
        }

        // Auto-generate Sale from ServiceOrder
        const sale = await tx.sale.create({
          data: {
            customerId: data.customerId,
            documentType: data.documentType,
            documentNumber: data.documentNumber,
            origin: 'Service',
            subtotal: parseFloat(calculatedSubtotal.toFixed(2)),
            tax: parseFloat(calculatedTax.toFixed(2)),
            total: parseFloat(calculatedTotal.toFixed(2)),
            statusId: completedStatus?.id || activeStatus.id,
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
        });

        // Link the Sale to the ServiceOrder
        await tx.serviceOrder.update({
          where: { id: serviceOrder.id },
          data: { saleId: sale.id },
        });
      }

      // Return the full service order with sale if generated
      return tx.serviceOrder.findUnique({
        where: { id: serviceOrder.id },
        include: {
          customer: true,
          status: true,
          items: {
            include: {
              product: true,
            },
          },
          sale: {
            include: {
              items: true,
            },
          },
        },
      });
    });
  }

  async update(id: string, data: any) {
    const existing = await this.prisma.serviceOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) throw new NotFoundException('Orden de servicio no encontrada');
    if (existing.orderStatus === 'Completado') {
      throw new BadRequestException('No se puede modificar una orden de servicio completada');
    }

    const activeStatus = await this.prisma.status.findUnique({ where: { name: 'Activo' } });
    const completedStatus = await this.prisma.status.findUnique({ where: { name: 'Completado' } });
    if (!activeStatus) throw new NotFoundException('Estado por defecto no encontrado');

    const customerId = data.customerId || existing.customerId;
    const finalPlate = data.plate || existing.plate;
    const finalVehicleModel = data.vehicleModel || existing.vehicleModel;
    const finalOrderStatus = data.orderStatus || existing.orderStatus;
    const finalDocType = data.documentType || 'Boleta';
    const finalDocNumber = data.documentNumber || 'B001-000001';

    const itemsToProcess = data.items || existing.items;

    // Validate stock if transition to Completado is happening
    const isCompletedTransition = finalOrderStatus === 'Completado';
    if (isCompletedTransition) {
      for (const item of itemsToProcess) {
        if (item.type === 'Product' && item.productId) {
          const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new NotFoundException(`Producto con ID ${item.productId} no encontrado`);
          if (product.stock < item.quantity) {
            throw new BadRequestException(
              `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
            );
          }
        }
      }
    }

    const calculatedTotal = itemsToProcess.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0,
    );
    const calculatedSubtotal = calculatedTotal / 1.18;
    const calculatedTax = calculatedTotal - calculatedSubtotal;

    return this.prisma.$transaction(async (tx) => {
      // 1. Delete existing items if new ones are provided
      if (data.items) {
        await tx.serviceOrderItem.deleteMany({
          where: { serviceOrderId: id },
        });
      }

      // 2. Update service order
      const updatedOrder = await tx.serviceOrder.update({
        where: { id },
        data: {
          customerId: data.customerId,
          plate: data.plate,
          vehicleModel: data.vehicleModel,
          mileage: data.mileage,
          notes: data.notes,
          orderStatus: data.orderStatus,
          total: parseFloat(calculatedTotal.toFixed(2)),
          items: data.items
            ? {
                create: data.items.map((item: any) => ({
                  type: item.type,
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  subtotal: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
                  productId: item.productId || null,
                })),
              }
            : undefined,
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

      // 3. If transitioning to Completado
      if (isCompletedTransition) {
        // Decrement stock for product items
        for (const item of itemsToProcess) {
          if (item.type === 'Product' && item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });

            await tx.movement.create({
              data: {
                productId: item.productId,
                type: 'Consumption',
                quantity: item.quantity,
                reference: `Servicio Placa: ${finalPlate} - ${finalVehicleModel}`,
              },
            });
          }
        }

        // Auto-generate Sale
        const sale = await tx.sale.create({
          data: {
            customerId,
            documentType: finalDocType,
            documentNumber: finalDocNumber,
            origin: 'Service',
            subtotal: parseFloat(calculatedSubtotal.toFixed(2)),
            tax: parseFloat(calculatedTax.toFixed(2)),
            total: parseFloat(calculatedTotal.toFixed(2)),
            statusId: completedStatus?.id || activeStatus.id,
            items: {
              create: itemsToProcess.map((item: any) => ({
                type: item.type,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
                productId: item.productId || null,
              })),
            },
          },
        });

        // Link Sale
        await tx.serviceOrder.update({
          where: { id },
          data: { saleId: sale.id },
        });
      }

      // Return the updated service order with sale details
      return tx.serviceOrder.findUnique({
        where: { id },
        include: {
          customer: true,
          status: true,
          items: {
            include: {
              product: true,
            },
          },
          sale: {
            include: {
              items: true,
            },
          },
        },
      });
    });
  }
}

