import { IsString, IsNotEmpty } from 'class-validator';

export class PatchCategoryStatusRequestDto {
  @IsString()
  @IsNotEmpty()
  statusName: string; // 'Activo' | 'Inactivo'
}
