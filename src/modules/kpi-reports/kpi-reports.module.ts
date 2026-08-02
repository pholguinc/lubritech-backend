import { Module } from '@nestjs/common';


import { KpiReportsController } from './controllers/kpi-reports.controller';
import { KpiReportService } from './services/kpi-reports.service';
import { KpiReportsRepository } from './repositories/kpi-reports.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [KpiReportsController],
  providers: [KpiReportService, KpiReportsRepository],
  exports: [KpiReportService],
})
export class KpiReportsModule {}
