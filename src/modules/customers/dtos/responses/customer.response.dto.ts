import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ description: 'ID del cliente' })
  id: string;

  @ApiPropertyOptional({ description: 'Código del cliente' })
  code?: string;

  @ApiProperty({ description: 'Nombre completo o Razón Social' })
  name: string;

  @ApiProperty({ description: 'Tipo de documento' })
  documentType: string;

  @ApiPropertyOptional({ description: 'Número de documento (RUC/DNI)' })
  documentNumber?: string;

  @ApiPropertyOptional({ description: 'Correo electrónico' })
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Dirección' })
  address?: string;

  @ApiPropertyOptional({ description: 'Distrito' })
  district?: string;

  @ApiPropertyOptional({ description: 'Provincia' })
  province?: string;

  @ApiPropertyOptional({ description: 'Departamento' })
  department?: string;

  @ApiPropertyOptional({ description: 'Ubigeo' })
  ubigeo?: string;

  @ApiProperty({ description: 'Cantidad de vehículos' })
  vehicleCount: number;

  @ApiProperty({ description: 'ID del estado' })
  statusId: string;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}