import { SetMetadata } from '@nestjs/common';

export const SKIP_RESPONSE_WRAPPER_KEY = 'skipResponseWrapper';

/**
 * Decorador para omitir el envoltorio de respuesta global.
 * Útil para endpoints que devuelven streams (PDF, XML) o respuestas JSON crudas
 * que no deben ser envueltas en la estructura estándar de la API.
 *
 * @example
 * \@SkipResponseWrapper()
 * \@Get('report.pdf')
 * getReport() { ... }
 */
export const SkipResponseWrapper = () =>
  SetMetadata(SKIP_RESPONSE_WRAPPER_KEY, true);
