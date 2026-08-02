import {
  ValidationPipe,
  ArgumentMetadata,
  BadRequestException,
  ValidationPipeOptions,
} from '@nestjs/common';

/**
 * Pipe de validación que extiende el `ValidationPipe` estándar de NestJS.
 * Añade una lógica de pre-procesamiento para normalizar cadenas booleanas ("true"/"false")
 * y formatea las excepciones de validación para que sigan el estándar de la aplicación.
 */
export class CustomValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      ...options,
      exceptionFactory: (validationErrors) => {
        // Extraemos todos los mensajes de error de forma plana (cada error es un elemento)
        const errors = validationErrors.flatMap((err) =>
          Object.values(err.constraints || {}),
        );

        // Retornamos el formato estándar solicitado por el usuario
        return new BadRequestException({
          message:
            'Los datos enviados no son válidos. Por favor, revisa los errores detallados.',
          errors: errors,
        });
      },
    });
  }

  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    if (
      (metadata.type === 'query' || metadata.type === 'body') &&
      typeof value === 'object' &&
      value !== null
    ) {
      const processed: Record<string, unknown> = {};

      for (const rawKey of Object.keys(value)) {
        const cleanKey = rawKey.replace(/[\t\r\n]/g, '').trim();
        let val = (value as Record<string, unknown>)[rawKey];

        if (typeof val === 'string') {
          val = val.replace(/[\t\r\n]/g, '').trim();
        }

        if (val === 'true') val = true;
        else if (val === 'false') val = false;

        processed[cleanKey] = val;
      }

      return (await super.transform(processed, metadata)) as unknown;
    }
    return (await super.transform(value, metadata)) as unknown;
  }
}
