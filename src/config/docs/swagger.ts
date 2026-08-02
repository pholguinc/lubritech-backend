import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { SWAGGER_CONFIG } from './swagger.config';
import { ALL_SWAGGER_TAGS } from '../modules-description.swagger';

export function configureSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const options = new DocumentBuilder()
    .setTitle(configService.get<string>('SWAGGER_TITLE', SWAGGER_CONFIG.title))
    .setDescription(
      configService.get<string>(
        'SWAGGER_DESCRIPTION',
        SWAGGER_CONFIG.description,
      ),
    )
    .setVersion(
      configService.get<string>('SWAGGER_VERSION', SWAGGER_CONFIG.title),
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Introduce tu token JWT en el header Authorization',
      },
      'JWT-auth',
    );

  // Registrar todos los tags definidos en ALL_SWAGGER_TAGS
  ALL_SWAGGER_TAGS.forEach((tag) => options.addTag(tag.name, tag.description));

  const serversEnv = configService.get<string>('SWAGGER_SERVERS', '');
  if (serversEnv) {
    const servers = serversEnv.split(',').filter((url) => url.trim() !== '');
    servers.forEach((url, index) =>
      options.addServer(url, `Server ${index + 1}`),
    );
  }

  const document = SwaggerModule.createDocument(app, options.build(), {
    deepScanRoutes: true,
  });

  let scalarRoute = configService.get<string>('SWAGGER_ROUTE', '/docs');

  if (!scalarRoute.startsWith('/')) {
    scalarRoute = `/${scalarRoute}`;
  }

  app.use(
    scalarRoute,
    apiReference({
      theme: 'bluePlanet',
      darkMode: true,
      layout: 'modern',
      spec: {
        content: document,
      },
    }),
  );
}
