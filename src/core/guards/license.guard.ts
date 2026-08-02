import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/database/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class LicenseGuard implements CanActivate {
  private isSeeded = false;

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Check if the route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Bypass check for public authentication and license check routes
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    if (isPublic || url.includes('/auth') || url.includes('/license')) {
      return true;
    }

    // 3. Auto-seed config if not present, then check license status
    try {
      let config = await this.prisma.systemConfig.findFirst({
        orderBy: { updatedAt: 'desc' },
      });

      if (!config) {
        // Auto-seed: active for 30 days
        const defaultExpiration = new Date();
        defaultExpiration.setDate(defaultExpiration.getDate() + 30);

        try {
          config = await this.prisma.systemConfig.create({
            data: {
              clientName: 'Cliente Lubritech',
              expirationDate: defaultExpiration,
              isActive: true,
            },
          });
        } catch (e) {
          // Fallback if another request just created it (race condition)
          config = await this.prisma.systemConfig.findFirst({
            orderBy: { updatedAt: 'desc' },
          });
        }
      }

      if (!config) {
        throw new HttpException(
          'Error interno: no se pudo verificar el estado de la licencia.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // 4. Validate license expiration and activity
      const currentDate = new Date();
      if (!config.isActive || currentDate > config.expirationDate) {
        throw new HttpException(
          'La membresía del sistema ha vencido. Realice el pago correspondiente para renovar su acceso.',
          HttpStatus.PAYMENT_REQUIRED,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Log DB connection errors but don't block if DB goes down temporarily, or block?
      // For license safety, we should block if the license check fails
      throw new HttpException(
        'Error de verificación de licencia de sistema. Contacte a soporte.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
