import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';
import { Public } from './core/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('license')
  async getLicenseStatus() {
    let config = await this.prisma.systemConfig.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    if (!config) {
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
        config = await this.prisma.systemConfig.findFirst({
          orderBy: { updatedAt: 'desc' },
        });
      }
    }

    if (!config) {
      throw new Error('System configuration could not be initialized or retrieved.');
    }

    return {
      clientName: config.clientName,
      expirationDate: config.expirationDate,
      isActive: config.isActive,
      daysLeft: Math.max(
        0,
        Math.ceil(
          (new Date(config.expirationDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      ),
    };
  }
}
