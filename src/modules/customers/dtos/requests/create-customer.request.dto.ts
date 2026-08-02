import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerRequestDto {
  @ApiPropertyOptional({ description: 'Código del cliente' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  code?: string;

  @ApiProperty({ description: 'Nombre completo o Razón Social' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Tipo de documento', default: 'RUC' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  documentType?: string;

  @ApiProperty({ description: 'Número de documento (RUC/DNI)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  documentNumber: string;

  @ApiPropertyOptional({ description: 'Correo electrónico' })
  @IsEmail()
  @IsOptional()
  @MaxLength(200)
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: 'Dirección' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Distrito' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({ description: 'Provincia' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  province?: string;

  @ApiPropertyOptional({ description: 'Departamento' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ description: 'Ubigeo' })
  @IsString()
  @IsOptional()
  @MaxLength(6)
  ubigeo?: string;
}