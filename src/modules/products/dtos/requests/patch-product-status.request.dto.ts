import { IsString, IsNotEmpty } from 'class-validator';

export class PatchProductStatusRequestDto {
  @IsString()
  @IsNotEmpty()
  statusName: string; // 'Activo' | 'Inactivo'
}
