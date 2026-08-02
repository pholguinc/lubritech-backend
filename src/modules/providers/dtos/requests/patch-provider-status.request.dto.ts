import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusEnum } from 'src/core/enums/status.enum';

export class PatchProviderStatusRequestDto {
  @ApiProperty({ description: 'Nombre del estado', enum: StatusEnum })
  @IsString()
  @IsNotEmpty()
  @IsEnum(StatusEnum)
  statusName: StatusEnum;
}
