import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * Decorador para marcar un endpoint como público.
 * Permite omitir la validación de autenticación (JWT/API Key) en los Guards globales.
 *
 * @example
 * \@Public()
 * \@Get('login')
 * login() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
