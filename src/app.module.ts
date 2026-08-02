import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ExternalQueryModule } from './modules/external-query/external-query.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { ProductsModule } from './modules/products/products.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { SalesModule } from './modules/sales/sales.module';
import { ServiceOrdersModule } from './modules/service-orders/service-orders.module';
import { MovementsModule } from './modules/movements/movements.module';
import { KpiReportsModule } from './modules/kpi-reports/kpi-reports.module';
import { LicenseGuard } from './core/guards/license.guard';
import { PrinterModule } from './modules/printer/printer.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule,
    CustomersModule,
    ExternalQueryModule,
    CategoriesModule,
    ProvidersModule,
    ProductsModule,
    PurchasesModule,
    SalesModule,
    ServiceOrdersModule,
    MovementsModule,
    KpiReportsModule,
    PrinterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LicenseGuard,
    },
  ],
})
export class AppModule {}
