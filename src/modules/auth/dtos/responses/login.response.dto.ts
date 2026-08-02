import { ApiProperty } from '@nestjs/swagger';
import { JwtPayload } from 'src/core/interfaces/jwt-payload.interface';

export class LoginResponseDto {
  @ApiProperty({ description: 'Datos del usuario autenticado' })
  user: JwtPayload;

  @ApiProperty({ description: 'Token JWT de autenticación' })
  token: string;
}
