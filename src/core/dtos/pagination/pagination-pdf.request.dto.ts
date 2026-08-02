import { IsDateString, IsOptional, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationPdfRequestDto {
  @ApiPropertyOptional({ description: 'Número de página', example: 1 })
  @IsPositive()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Número de registros por página',
    example: 20,
  })
  @IsPositive()
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio (YYYY-MM-DD)',
    example: '2023-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha fin (YYYY-MM-DD)',
    example: '2023-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
