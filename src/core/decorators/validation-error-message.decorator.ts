import { SetMetadata } from '@nestjs/common';

export const VALIDATION_ERROR_MESSAGE_KEY = 'validation_error_message';

/**
 * Mapa de mensajes de error personalizados indexados por código de estado HTTP.
 */
export type ErrorMessageMap = Record<number, string>;

/**
 * Decorador para definir mensajes de error personalizados que serán capturados
 * por el ValidationErrorMessagePipe durante la validación de DTOs.
 *
 * Permite especificar un mensaje único (string) o un mapa indexado por código HTTP.
 *
 * @param messages - Mensaje de error o mapa de mensajes.
 * @example
 * \@ValidationErrorMessage('Datos de entrada inválidos')
 * \@Post()
 * create(\@Body() dto: CreateDto) { ... }
 */
export const ValidationErrorMessage = (messages: ErrorMessageMap | string) =>
  SetMetadata(
    VALIDATION_ERROR_MESSAGE_KEY,
    typeof messages === 'string' ? { 400: messages, 500: messages } : messages,
  );
