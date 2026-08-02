import { HttpException } from '@nestjs/common';
import { VALIDATION_ERROR_MESSAGE_KEY } from '../../core/decorators/validation-error-message.decorator';
import { RESPONSE_MESSAGE_KEY } from '../../core/decorators/response-message.decorator';

/**
 * Decorador para centralizar el manejo de errores en los servicios o controladores.
 * Captura excepciones y las transforma al formato estándar de la aplicación.
 *
 * @param userMessage - El mensaje amigable que verá el usuario final tanto en éxito como en error.
 */
export function HandleServiceError(userMessage: string) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    _target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    const originalMethod = descriptor.value;

    if (!originalMethod) {
      return;
    }

    descriptor.value = async function (
      this: { logger?: { error: (msg: string) => void } },
      ...args: unknown[]
    ): Promise<unknown> {
      try {
        return await (originalMethod.apply(this, args) as ReturnType<T>);
      } catch (error: unknown) {
        let originalErrors: string[] = ['Error interno del servidor'];
        let statusCode = 500;

        if (error instanceof HttpException) {
          statusCode = error.getStatus();
          const res = error.getResponse();
          if (typeof res === 'object' && res !== null && 'message' in res) {
            const resMsg = (res as Record<string, unknown>).message;
            originalErrors = Array.isArray(resMsg)
              ? (resMsg as string[])
              : [String(resMsg)];
          } else {
            originalErrors = [
              error instanceof Error ? error.message : String(error),
            ];
          }
        } else if (error instanceof Error) {
          const errorName = typeof error.name === 'string' ? error.name : '';
          if (
            (error as { code?: string }).code === '23505' ||
            errorName.startsWith('Prisma') ||
            error.message.includes('prisma.')
          ) {
            if (
              error.message.includes('23505') ||
              error.message.includes('P2002') ||
              (error as { code?: string }).code === '23505'
            ) {
              statusCode = 409;
              originalErrors = [
                'El registro ya existe o hay un dato duplicado (ej. RUC, Dominio o Correo).',
              ];
            } else if (error.message.includes('P2025')) {
              statusCode = 404;
              originalErrors = ['El registro solicitado no fue encontrado.'];
            } else {
              statusCode = 500;
              originalErrors = [
                'Ocurrió un error interno al procesar los datos en la base de datos.',
              ];
            }
          } else {
            originalErrors = [error.message];
          }
        }

        if (this.logger && typeof this.logger.error === 'function') {
          this.logger.error(
            `Error en ${propertyKey}: ${originalErrors.join(', ')}`,
          );
        }
        // Always log the actual original error to standard console.error for debugging
        console.error(
          `[HandleServiceError] Exception in ${propertyKey}:`,
          error,
        );

        throw new HttpException(
          {
            message: userMessage,
            errors: originalErrors,
          },
          statusCode,
        );
      }
    } as T;

    const keys = Reflect.getMetadataKeys(originalMethod);
    for (const key of keys) {
      const value = Reflect.getMetadata(key, originalMethod);
      Reflect.defineMetadata(key, value, descriptor.value);
    }

    Reflect.defineMetadata(
      VALIDATION_ERROR_MESSAGE_KEY,
      {
        400: userMessage,
        409: userMessage,
        500: userMessage,
        404: userMessage,
        403: userMessage,
      },
      descriptor.value,
    );

    Reflect.defineMetadata(RESPONSE_MESSAGE_KEY, userMessage, descriptor.value);
  };
}
