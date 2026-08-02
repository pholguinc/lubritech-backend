import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SKIP_RESPONSE_WRAPPER_KEY } from '../decorators/skip-response-wrapper.decorator';
import { VALIDATION_ERROR_MESSAGE_KEY } from '../../core/decorators/validation-error-message.decorator';
import { RESPONSE_MESSAGE_KEY } from '../../core/decorators/response-message.decorator';

interface StandardResponse<T = unknown> {
  statusCode: number;
  status: 'Success' | 'Error';
  message: string;
  data: T | null;
}

@Injectable()
export class CustomResponseInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T | null> | StreamableFile | Buffer
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T | null> | StreamableFile | Buffer> {
    const skip = Reflect.getMetadata(
      SKIP_RESPONSE_WRAPPER_KEY,
      context.getHandler(),
    ) as boolean | undefined;
    if (skip) return next.handle();

    const http = context.switchToHttp();
    const response = http.getResponse<Response>();

    const errorMessageMap = Reflect.getMetadata(
      VALIDATION_ERROR_MESSAGE_KEY,
      context.getHandler(),
    ) as Record<number, string> | undefined;

    const responseMessage = Reflect.getMetadata(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    ) as string | undefined;

    return next.handle().pipe(
      map((data: T) => {
        if (data instanceof StreamableFile || Buffer.isBuffer(data)) {
          return data;
        }

        // Si el servicio devuelve un objeto con un campo 'message', lo promocionamos al nivel superior
        let finalMessage = responseMessage || 'Success';
        let finalData = data ?? null;

        if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          Object.keys(data).length === 1
        ) {
          finalMessage = String((data as { message: string }).message);
          finalData = null;
        } else if (data && typeof data === 'object' && 'message' in data) {
          // Si tiene message pero también otros campos, extraemos el message pero dejamos el resto en data
          const { message, ...rest } = data as Record<string, unknown>;
          finalMessage = String(message);
          finalData = rest as unknown as NonNullable<T>;
        }

        return {
          statusCode: response.statusCode ?? 200,
          status: 'Success' as const,
          message: finalMessage,
          data: finalData as T | null,
        };
      }),
      catchError((err: unknown) => {
        let statusCode = 500;
        let errors: string[] = ['Internal server error'];

        let message: string | undefined;

        if (err && typeof err === 'object') {
          const errorObj = err as Record<string, unknown>;

          if (err instanceof HttpException) {
            statusCode = err.getStatus() ?? 500;
            const res = err.getResponse();

            if (res instanceof StreamableFile || Buffer.isBuffer(res)) {
              return throwError(() => err);
            }

            if (typeof res === 'object' && res !== null) {
              const resObj = res as Record<string, unknown>;

              if (typeof resObj.message === 'string') {
                message = resObj.message;
              }

              if (Array.isArray(resObj.errors)) {
                errors = resObj.errors as string[];
              } else if (Array.isArray(resObj.message)) {
                errors = resObj.message as string[];
              } else if (typeof resObj.message === 'string') {
                errors = [resObj.message];
              }
            } else if (typeof res === 'string') {
              errors = [res];
              message = res;
            }
          } else if (typeof errorObj.message === 'string') {
            const errorName =
              typeof errorObj.name === 'string' ? errorObj.name : '';
            if (
              errorName.startsWith('Prisma') ||
              errorObj.message.includes('prisma.')
            ) {
              console.error(
                'Unhandled Database/Prisma Exception:',
                errorObj.message,
              );
              if (
                errorObj.message.includes('23505') ||
                errorObj.message.includes('P2002')
              ) {
                statusCode = 409;
                errors = [
                  'El registro ya existe o hay un dato duplicado (ej. RUC, Dominio o Correo).',
                ];
                message = undefined;
              } else if (errorObj.message.includes('P2025')) {
                statusCode = 404;
                errors = ['El registro solicitado no fue encontrado.'];
                message = undefined;
              } else {
                statusCode = 500;
                errors = [
                  'Ocurrió un error interno al procesar los datos en la base de datos.',
                ];
                message = undefined;
              }
            } else {
              errors = [errorObj.message];
              message = errorObj.message;
            }
          }
        } else if (typeof err === 'string') {
          errors = [err];
          message = err;
        }

        return throwError(
          () =>
            new HttpException(
              {
                statusCode,
                status: 'Error',
                message:
                  errorMessageMap?.[statusCode] ||
                  message ||
                  (errors.length > 0 ? errors[0] : 'Error'),
                data: null,
                errors,
              },
              statusCode,
            ),
        );
      }),
    );
  }
}
