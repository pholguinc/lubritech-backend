import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, VersioningType } from '@nestjs/common';
import { CustomResponseInterceptor } from './core/interceptors/custom-response.interceptor';
import { CustomValidationPipe } from './core/pipes/custom-validation.pipe';
import { configureSwagger, envs } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new CustomResponseInterceptor());
  app.useGlobalPipes(
    new CustomValidationPipe({
      whitelist: false, // Permite propiedades extra (no las remueve)
      forbidNonWhitelisted: false, // No lanza error si hay propiedades extra
      transform: true, // Transforma los payloads a instancias del DTO
      transformOptions: {
        enableImplicitConversion: true, // Convierte query params automáticamente (string -> number)
      },
    }),
  );
  configureSwagger(app);
  await app.listen(envs.port);
  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on: http://localhost:${envs.port}/api/v1`);
  logger.log(`Swagger documentation: http://localhost:${envs.port}/docs`);
}
bootstrap();
