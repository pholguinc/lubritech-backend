import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { CustomValidationPipe } from './custom-validation.pipe';

/**
 * Pipe de validación personalizado que extiende de `CustomValidationPipe`.
 * Su propósito es interceptar errores de validación de `class-validator` y retornar
 * una respuesta estructurada con un mensaje personalizado definido en tiempo de construcción.
 */
export class ValidationErrorMessagePipe extends CustomValidationPipe {
  /**
   * Crea una instancia del pipe con un mensaje descriptivo para la respuesta.
   *
   * @param customMessage - El mensaje que se incluirá en el campo `data` de la respuesta de error.
   */
  constructor(customMessage: string) {
    super({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.flatMap((e) =>
          Object.values(e.constraints ?? {}),
        );
        return new BadRequestException({
          statusCode: 400,
          message: 'Error',
          data: [{ message: customMessage }],
          errors: messages,
        });
      },
    });
  }
}
