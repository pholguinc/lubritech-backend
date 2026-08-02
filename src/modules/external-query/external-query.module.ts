import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalQueryController } from './controllers/external-query.controller';
import { SunatQueryService } from './services/sunat-query.service';
import { ReniecQueryService } from './services/reniec-query.service';
import { UbigeoQueryService } from './services/ubigeos-query.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [ExternalQueryController],
  providers: [SunatQueryService, ReniecQueryService, UbigeoQueryService],
  exports: [SunatQueryService, ReniecQueryService, UbigeoQueryService],
})
export class ExternalQueryModule {}
