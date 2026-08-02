import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginRequestDto } from '../dtos/login.request.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HandleServiceError } from 'src/core/decorators/handle-service-error.decorator';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';
import { LoginResponseDto } from '../dtos/responses/login.response.dto';

@ApiTags('🔐 Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicia sesión con el correo electrónico y la contraseña del usuario.' })
  @ApiResponse({ status: 201, type: LoginResponseDto, description: 'Login exitoso. Se devuelven los tokens JWT.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o usuario inactivo.' })
  @ResponseMessage('Inicio de sesión exitoso')
  @HandleServiceError('Error al iniciar sesión')
  async login(@Body() dto: LoginRequestDto) {
    return this.authService.login(dto);
  }
}
