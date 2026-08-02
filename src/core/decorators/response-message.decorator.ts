import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'response_message';
/**
 * Decorador para definir un mensaje de éxito personalizado en la respuesta HTTP.
 * Este mensaje es capturado por un interceptor global para estandarizar la respuesta.
 *
 * @param message - El mensaje descriptivo del éxito de la operación.
 * @example
 * \@ResponseMessage('Usuario creado exitosamente')
 * \@Post()
 * create() { ... }
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);
