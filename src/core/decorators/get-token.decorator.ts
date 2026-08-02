import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (
      request.cookies['access_token'] ||
      request.cookies['refresh_token'] ||
      request.headers.authorization?.replace('Bearer ', '')
    );
  },
);
