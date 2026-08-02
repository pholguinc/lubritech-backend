import { applyDecorators, Type } from '@nestjs/common';
import {
  getSchemaPath,
  ApiExtraModels,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { StandardResponseDto } from '../dtos/common-response.dto';

/**
 * Decorador genérico para documentar respuestas de éxito estandarizadas en Swagger.
 * Encapsula un modelo de datos específico dentro de la estructura general de `StandardResponseDto`.
 *
 * @param model - La clase del DTO que representa los datos contenidos en el campo `data`.
 * @param status - El código de estado HTTP (200 OK o 201 Created). Por defecto es 200.
 * @param isArray - Indica si el campo `data` contiene un solo objeto o un arreglo de objetos del modelo.
 *
 * @example
 * \@ApiStandardResponse(UserResponseDto, 201)
 * \@Post()
 * create() { ... }
 */
export const ApiStandardResponse = <TModel extends Type<unknown>>(
  model: TModel,
  status: 200 | 201 = 200,
  isArray = false,
) => {
  const ResponseDecorator = status === 201 ? ApiCreatedResponse : ApiOkResponse;

  return applyDecorators(
    ApiExtraModels(StandardResponseDto, model),
    ResponseDecorator({
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardResponseDto) },
          {
            properties: {
              data: isArray
                ? { type: 'array', items: { $ref: getSchemaPath(model) } }
                : { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
};
