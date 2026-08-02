import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { CreateServiceOrderItemDto } from './create-service-order.request.dto';

export class UpdateServiceOrderRequestDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  plate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  vehicleModel?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  mileage?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ enum: ['Iniciado', 'En Proceso', 'Completado'] })
  @IsString()
  @IsOptional()
  orderStatus?: string;

  @ApiPropertyOptional({ enum: ['Boleta', 'Factura', 'Ticket'] })
  @IsString()
  @IsOptional()
  documentType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  documentNumber?: string;

  @ApiPropertyOptional({ type: [CreateServiceOrderItemDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceOrderItemDto)
  items?: CreateServiceOrderItemDto[];
}
