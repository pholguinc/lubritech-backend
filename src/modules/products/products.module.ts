import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductService } from './services/products.service';
import { ProductsRepository } from './repositories/products.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProductsController],
  providers: [ProductService, ProductsRepository],
  exports: [ProductService],
})
export class ProductsModule {}
