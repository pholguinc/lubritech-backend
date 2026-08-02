import { Injectable } from '@nestjs/common';
import { Prisma, Customer } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CustomerUncheckedCreateInput): Promise<Customer> {
    return this.prisma.customer.create({ 
      data,
      include: { status: true } 
    });
  }

  async findAll(
    skip: number,
    take: number,
    where?: Prisma.CustomerWhereInput,
  ): Promise<[Customer[], number]> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { status: true },
      }),
      this.prisma.customer.count({ where }),
    ]);
    return [items, total];
  }

  async findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { id },
      include: { status: true },
    });
  }

  async findByDocument(documentNumber: string): Promise<Customer | null> {
    return this.prisma.customer.findFirst({
      where: { documentNumber },
    });
  }

  async findLastCode(): Promise<string | null> {
    const lastCustomer = await this.prisma.customer.findFirst({
      where: { code: { startsWith: 'CLI' } },
      orderBy: { code: 'desc' },
    });
    return lastCustomer?.code || null;
  }

  async update(id: string, data: Prisma.CustomerUncheckedUpdateInput): Promise<Customer> {
    return this.prisma.customer.update({
      where: { id },
      data,
      include: { status: true },
    });
  }
}
