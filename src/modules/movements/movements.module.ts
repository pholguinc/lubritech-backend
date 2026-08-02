import { Module } from '@nestjs/common';
import { MovementsController } from './controllers/movements.controller';
import { MovementsService } from './services/movements.service';
import { MovementsRepository } from './repositories/movements.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MovementsController],
  providers: [MovementsService, MovementsRepository],
  exports: [MovementsService, MovementsRepository],
})
export class MovementsModule {}
