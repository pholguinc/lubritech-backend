import { IsString, IsNotEmpty, IsOptional, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderRequestDto {
  @ApiProperty({ description: 'Razón social del proveedor' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  company: string;

  @ApiProperty({ description: 'Tipo de documento (Ej: RUC)', required: false, default: 'RUC' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  documentType?: string;

  @ApiProperty({ description: 'Número de documento (RUC/DNI)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  documentNumber: string;

  @ApiProperty({ description: 'Nombre de contacto', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  contact?: string;

  @ApiProperty({ description: 'Teléfono del proveedor', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  phone?: string;

  @ApiProperty({ description: 'Correo electrónico del proveedor', required: false })
  @IsEmail()
  @IsOptional()
  @MaxLength(200)
  email?: string;
}