import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class KpiReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getLicenseInfo() {
    return this.prisma.systemConfig.findFirst();
  }

  async getSalesStats(startDate: Date, endDate: Date) {
    const result = await this.prisma.sale.aggregate({
      _sum: { total: true },
      where: { date: { gte: startDate, lte: endDate } },
    });
    return result._sum.total || 0;
  }

  async getPurchasesStats(startDate: Date, endDate: Date) {
    const result = await this.prisma.purchase.aggregate({
      _sum: { total: true },
      where: { date: { gte: startDate, lte: endDate } },
    });
    return result._sum.total || 0;
  }

  async getCustomersCount() {
    return this.prisma.customer.count();
  }

  async getNewCustomersCount(startDate: Date, endDate: Date) {
    return this.prisma.customer.count({
      where: { createdAt: { gte: startDate, lte: endDate } },
    });
  }

  async getTodayIncome(startOfDay: Date, endOfDay: Date) {
    const result = await this.prisma.sale.aggregate({
      _sum: { total: true },
      where: { date: { gte: startOfDay, lte: endOfDay } },
    });
    return result._sum.total || 0;
  }

  async getServicesCount(startDate: Date, endDate: Date) {
    return this.prisma.serviceOrder.count({
      where: { date: { gte: startDate, lte: endDate } },
    });
  }

  async getLowStockCount(threshold: number = 5) {
    return this.prisma.product.count({
      where: { stock: { lte: threshold } },
    });
  }

  async getPendingChangesCount() {
    // Mock implementation for "Próximos Cambios"
    return 0;
  }

  async getDocumentsCount(documentType: string) {
    return this.prisma.sale.count({
      where: { documentType },
    });
  }

  async getQuotesCount() {
    return this.prisma.serviceOrder.count({
      where: { orderStatus: 'Pendiente' },
    });
  }

  async getSalesHistory(startDate: Date, endDate: Date) {
    // We group by month to get the totals
    // Since Prisma groupBy doesn't fully support truncating dates easily across DBs in raw ORM,
    // we'll fetch the sales in the period and process them in the service
    // or use a raw query. Fetching the sales date and total is efficient enough for this scale.
    return this.prisma.sale.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: { date: true, total: true },
      orderBy: { date: 'asc' }
    });
  }

  async getServiceDistribution(startDate: Date, endDate: Date) {
    // We need to count occurrences of services in SaleItems
    return this.prisma.saleItem.findMany({
      where: {
        type: 'Service',
        sale: {
          date: { gte: startDate, lte: endDate }
        }
      },
      select: { description: true }
    });
  }

  async getPurchasesHistory(startDate: Date, endDate: Date) {
    return this.prisma.purchase.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: { date: true, total: true },
      orderBy: { date: 'asc' }
    });
  }

  async getTopProducts(startDate: Date, endDate: Date) {
    return this.prisma.saleItem.findMany({
      where: {
        type: 'Product',
        sale: {
          date: { gte: startDate, lte: endDate }
        }
      },
      select: { description: true, quantity: true }
    });
  }
}
