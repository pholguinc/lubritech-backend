import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { StandardResponseDto } from '../dtos/common-response.dto';

const errorSchema = () => ({
  allOf: [
    { $ref: getSchemaPath(StandardResponseDto) },
    {
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Error message' },
        data: { type: 'object', nullable: true, example: null },
        errors: {
          type: 'array',
          items: { type: 'string' },
          example: ['Validation error'],
        },
      },
    },
  ],
});

const STATUS_DECORATORS: Record<
  number,
  (opts: object) => MethodDecorator & ClassDecorator
> = {
  [HttpStatus.BAD_REQUEST]: ApiBadRequestResponse,
  [HttpStatus.UNAUTHORIZED]: ApiUnauthorizedResponse,
  [HttpStatus.FORBIDDEN]: ApiForbiddenResponse,
  [HttpStatus.NOT_FOUND]: ApiNotFoundResponse,
  [HttpStatus.INTERNAL_SERVER_ERROR]: ApiInternalServerErrorResponse,
};

/**
 * Decorador compuesto para estandarizar la documentación de Swagger para respuestas de error.
 * Aplica automáticamente los decoradores de NestJS Swagger (`ApiBadRequestResponse`, etc.)
 * utilizando un esquema unificado basado en `StandardResponseDto`.
 *
 * @param statuses - Lista de códigos de estado HTTP a documentar como posibles errores.
 * Si no se pasan argumentos, documenta por defecto: 400 (Bad Request), 401 (Unauthorized) y 500 (Internal Server Error).
 *
 * @example
 * \@ApiErrorResponse(HttpStatus.NOT_FOUND, HttpStatus.BAD_REQUEST)
 * \@Get(':id')
 * findOne() { ... }
 */
export const ApiErrorResponse = (...statuses: number[]) => {
  if (statuses.length === 0) {
    statuses = [
      HttpStatus.BAD_REQUEST,
      HttpStatus.UNAUTHORIZED,
      HttpStatus.INTERNAL_SERVER_ERROR,
    ];
  }
  const decorators: (MethodDecorator & ClassDecorator)[] = [
    ApiExtraModels(StandardResponseDto),
  ];

  for (const status of statuses) {
    const decorator = STATUS_DECORATORS[status];
    if (decorator) {
      decorators.push(decorator({ schema: errorSchema() }));
    }
  }

  return applyDecorators(...decorators);
};
