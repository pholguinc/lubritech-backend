import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';

export class CreateServiceOrderItemDto {
  @ApiProperty({ description: 'ID del producto (obligatorio para tipo Product)' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty({ enum: ['Product', 'Service'] })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateServiceOrderRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  plate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vehicleModel: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  mileage: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ enum: ['Pendiente', 'En Proceso', 'Completado'] })
  @IsString()
  @IsNotEmpty()
  orderStatus: string;

  @ApiProperty({ enum: ['Boleta', 'Factura', 'Ticket'] })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @ApiProperty({ type: [CreateServiceOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateServiceOrderItemDto)
  items: CreateServiceOrderItemDto[];
}
