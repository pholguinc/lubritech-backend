import { Injectable } from '@nestjs/common';
import { KpiReportsRepository } from '../repositories/kpi-reports.repository';

@Injectable()
export class KpiReportService {
  constructor(private readonly kpiReportsRepository: KpiReportsRepository) {}

  async getDashboardGeneral() {
    const now = new Date();
    
    // Helper to calculate percentage difference
    const getPercentage = (current: number, previous: number): string => {
      if (previous === 0) return current > 0 ? '+100.0' : '0.0';
      const diff = ((current - previous) / previous) * 100;
      return (diff > 0 ? '+' : '') + diff.toFixed(1);
    };

    // Dates for current month
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Dates for previous month
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    
    // Dates for today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      licenseInfo,
      currentSales,
      previousSales,
      currentPurchases,
      previousPurchases,
      totalCustomers,
      newCustomersThisMonth,
      todayIncome,
      monthlyServices,
      lowStock,
      pendingChanges,
      boletasCount,
      facturasCount,
      quotesCount
    ] = await Promise.all([
      this.kpiReportsRepository.getLicenseInfo(),
      this.kpiReportsRepository.getSalesStats(startOfCurrentMonth, endOfCurrentMonth),
      this.kpiReportsRepository.getSalesStats(startOfPreviousMonth, endOfPreviousMonth),
      this.kpiReportsRepository.getPurchasesStats(startOfCurrentMonth, endOfCurrentMonth),
      this.kpiReportsRepository.getPurchasesStats(startOfPreviousMonth, endOfPreviousMonth),
      this.kpiReportsRepository.getCustomersCount(),
      this.kpiReportsRepository.getNewCustomersCount(startOfCurrentMonth, endOfCurrentMonth),
      this.kpiReportsRepository.getTodayIncome(startOfToday, endOfToday),
      this.kpiReportsRepository.getServicesCount(startOfCurrentMonth, endOfCurrentMonth),
      this.kpiReportsRepository.getLowStockCount(5),
      this.kpiReportsRepository.getPendingChangesCount(),
      this.kpiReportsRepository.getDocumentsCount('Boleta'),
      this.kpiReportsRepository.getDocumentsCount('Factura'),
      this.kpiReportsRepository.getQuotesCount()
    ]);

    let daysLeft = 0;
    if (licenseInfo && licenseInfo.expirationDate) {
      daysLeft = Math.max(0, Math.ceil((new Date(licenseInfo.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return {
      license: {
        plan: licenseInfo?.clientName || 'Premium',
        isActive: licenseInfo?.isActive || false,
        daysLeft: daysLeft
      },
      sales: {
        amount: currentSales,
        percentageVsPrevious: getPercentage(currentSales, previousSales)
      },
      purchases: {
        amount: currentPurchases,
        percentageVsPrevious: getPercentage(currentPurchases, previousPurchases)
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth
      },
      todayIncome: {
        amount: todayIncome
      },
      servicesThisMonth: {
        total: monthlyServices
      },
      lowStock: {
        total: lowStock
      },
      pendingChanges: {
        total: pendingChanges
      },
      boletas: {
        total: boletasCount
      },
      facturas: {
        total: facturasCount
      },
      quotes: {
        total: quotesCount
      }
    };
  }

  async getDashboardCharts() {
    const now = new Date();
    // Start of month 5 months ago (total 6 months including current)
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [salesRaw, servicesRaw, purchasesRaw, topProductsRaw] = await Promise.all([
      this.kpiReportsRepository.getSalesHistory(startDate, endDate),
      this.kpiReportsRepository.getServiceDistribution(startDate, endDate),
      this.kpiReportsRepository.getPurchasesHistory(startDate, endDate),
      this.kpiReportsRepository.getTopProducts(startDate, endDate)
    ]);

    // Format sales by month
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const salesMap = new Map<string, number>();
    const purchasesMap = new Map<string, number>();
    
    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      salesMap.set(mName, 0);
      purchasesMap.set(mName, 0);
    }

    salesRaw.forEach(sale => {
      const mName = monthNames[sale.date.getMonth()];
      if (salesMap.has(mName)) {
        salesMap.set(mName, salesMap.get(mName)! + sale.total);
      }
    });

    purchasesRaw.forEach(purchase => {
      const mName = monthNames[purchase.date.getMonth()];
      if (purchasesMap.has(mName)) {
        purchasesMap.set(mName, purchasesMap.get(mName)! + purchase.total);
      }
    });

    const salesHistory = Array.from(salesMap.entries()).map(([month, total]) => ({ month, total }));
    const margins = Array.from(salesMap.entries()).map(([month, totalVentas]) => ({
      month,
      ventas: totalVentas,
      compras: purchasesMap.get(month) || 0
    }));

    // Income evolution (daily for current month)
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Initialize daily map
    const dailyIncomeMap = new Map<number, number>();
    for (let i = 1; i <= daysInMonth; i++) {
      dailyIncomeMap.set(i, 0);
    }

    salesRaw.forEach(sale => {
      if (sale.date.getMonth() === currentMonth && sale.date.getFullYear() === currentYear) {
        const day = sale.date.getDate();
        dailyIncomeMap.set(day, dailyIncomeMap.get(day)! + sale.total);
      }
    });

    let accumulated = 0;
    const incomeEvolution = Array.from(dailyIncomeMap.entries()).map(([day, total]) => {
      accumulated += total;
      return { day, total, accumulated };
    });

    // Format service distribution (Top 4 + Otros)
    const serviceCounts: Record<string, number> = {};
    
    servicesRaw.forEach(item => {
      const name = item.description;
      serviceCounts[name] = (serviceCounts[name] || 0) + 1;
    });

    const sortedServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, percentage: count })) // we use 'percentage' field as 'count' for now to not break frontend contract
      .sort((a, b) => b.percentage - a.percentage);

    let serviceDistribution = sortedServices;
    if (sortedServices.length > 4) {
      const top4 = sortedServices.slice(0, 4);
      const othersCount = sortedServices.slice(4).reduce((sum, curr) => sum + curr.percentage, 0);
      serviceDistribution = [...top4, { name: 'Otros', percentage: othersCount }];
    }

    // Top 5 Products
    const productCounts: Record<string, number> = {};
    topProductsRaw.forEach(item => {
      productCounts[item.description] = (productCounts[item.description] || 0) + item.quantity;
    });

    const topProducts = Object.entries(productCounts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Peak Hours Heatmap (Sales intensity by day and hour)
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const hourBins = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
    
    // Initialize heatmap matrix: [dayIndex][hourBin] -> count
    const heatmapCounts: Record<string, Record<string, number>> = {};
    // We only care about Mon to Sat (indices 1 to 6)
    for (let d = 1; d <= 6; d++) {
      heatmapCounts[dayNames[d]] = {};
      hourBins.forEach(h => heatmapCounts[dayNames[d]][h] = 0);
    }

    salesRaw.forEach(sale => {
      const dayIndex = sale.date.getDay(); // 0 is Sunday
      if (dayIndex === 0) return; // Skip Sundays if they are closed

      const dayStr = dayNames[dayIndex];
      const hour = sale.date.getHours();
      
      // Map hour to bin
      let bin = '18:00';
      if (hour < 10) bin = '08:00';
      else if (hour < 12) bin = '10:00';
      else if (hour < 14) bin = '12:00';
      else if (hour < 16) bin = '14:00';
      else if (hour < 18) bin = '16:00';

      if (heatmapCounts[dayStr] && heatmapCounts[dayStr][bin] !== undefined) {
        heatmapCounts[dayStr][bin]++;
      }
    });

    // We want the array sorted from Sab -> Lun for the frontend display
    const daysOrder = ['Sáb', 'Vie', 'Jue', 'Mié', 'Mar', 'Lun'];
    const peakHours = daysOrder.map(dayStr => {
      return {
        name: dayStr,
        data: hourBins.slice(0, 5).map(bin => ({ x: bin, y: heatmapCounts[dayStr]?.[bin] || 0 })) // we slice to 16:00 to match design
      };
    });

    return {
      salesHistory,
      serviceDistribution,
      margins,
      incomeEvolution,
      topProducts,
      peakHours
    };
  }
}
