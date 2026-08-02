import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateCustomerStatusRequestDto {
  @ApiProperty({ description: 'Nombre del nuevo estado' })
  @IsString()
  @IsNotEmpty()
  statusName: string;
}
