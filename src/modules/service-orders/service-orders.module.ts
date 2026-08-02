import { Module } from '@nestjs/common';
import { ServiceOrdersController } from './controllers/service-orders.controller';
import { ServiceOrdersService } from './services/service-orders.service';
import { ServiceOrdersRepository } from './repositories/service-orders.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ServiceOrdersController],
  providers: [ServiceOrdersService, ServiceOrdersRepository],
  exports: [ServiceOrdersService, ServiceOrdersRepository],
})
export class ServiceOrdersModule { }
