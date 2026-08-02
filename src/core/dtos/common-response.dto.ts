import { ApiProperty } from '@nestjs/swagger';

export class StandardResponseDto<T> {
  @ApiProperty({ description: 'Código de estado HTTP', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Mensaje de la operación', example: 'Success' })
  message: string;

  @ApiProperty({ description: 'Datos de la respuesta' })
  data: T | null;

  @ApiProperty({
    description: 'Errores encontrados',
    required: false,
    type: [String],
  })
  errors?: string[];
}
