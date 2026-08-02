import { Module } from '@nestjs/common';
import { ProvidersController } from './controllers/providers.controller';
import { ProviderService } from './services/providers.service';
import { ProvidersRepository } from './repositories/providers.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProvidersController],
  providers: [ProviderService, ProvidersRepository],
  exports: [ProviderService],
})
export class ProvidersModule {}
