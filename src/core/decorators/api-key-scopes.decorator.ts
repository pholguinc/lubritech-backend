import { SetMetadata } from '@nestjs/common';

export const API_KEY_SCOPES_KEY = 'api_key_scopes';

/**
 * Define los scopes requeridos para acceder al endpoint con una API key.
 *
 * Si la key tiene alcances definidos, debe incluir TODOS los scopes especificados aquí.
 * Si la key tiene alcances = null o "*", se permite sin restricción de scope.
 *
 * @example
 * // Solo keys con scope "facturas:write" pueden acceder
 * @ApiKeyScopes('facturas:write')
 * @Post()
 * create() {}
 *
 * @example
 * // Requiere ambos scopes
 * @ApiKeyScopes('facturas:read', 'reportes:read')
 * @Get()
 * list() {}
 */
export const ApiKeyScopes = (...scopes: string[]) =>
  SetMetadata(API_KEY_SCOPES_KEY, scopes);
