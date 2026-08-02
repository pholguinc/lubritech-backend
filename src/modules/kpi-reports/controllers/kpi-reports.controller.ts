import { Controller, Get } from '@nestjs/common';
import { KpiReportService } from '../services/kpi-reports.service';

@Controller('kpi-reports')
export class KpiReportsController {
  constructor(private readonly kpiReportService: KpiReportService) {}

  @Get('dashboard')
  async getDashboardGeneral() {
    return this.kpiReportService.getDashboardGeneral();
  }

  @Get('charts')
  async getDashboardCharts() {
    return this.kpiReportService.getDashboardCharts();
  }
}
