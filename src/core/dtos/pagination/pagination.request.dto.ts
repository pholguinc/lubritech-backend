import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationRequestDto {
  @ApiPropertyOptional({ description: 'Número de página', example: 1 })
  @IsPositive({ message: 'El campo page debe ser un número positivo' })
  @IsOptional()
  @Type(() => Number)
  @IsNotEmpty()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    example: 10,
  })
  @IsPositive({ message: 'El campo limit debe ser un número positivo' })
  @Type(() => Number)
  @IsNotEmpty()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Texto de búsqueda general',
    example: '',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio para el rango de búsqueda (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin para el rango de búsqueda (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Estado del registro',
    example: '',
  })
  @IsString()
  @IsOptional()
  status?: string;

}
