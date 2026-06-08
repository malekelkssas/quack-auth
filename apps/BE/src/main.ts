/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BE_ROUTES, ENV_KEYS } from '@shared/constants';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { dbClient } from '@quack/mongoose/client';
import { AppModule } from './app/app.module';

function resolveCorsOrigins(): string | string[] {
  const origins =
    process.env[ENV_KEYS.CORS_ORIGIN]
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];
  return origins.length > 0 ? origins : 'http://localhost:4200';
}

async function bootstrap() {
  await dbClient();

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: resolveCorsOrigins(),
      credentials: true,
    },
  });
  const globalPrefix = BE_ROUTES.BASE;
  app.setGlobalPrefix(globalPrefix);

  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Quack Auth API')
      .setDescription('Quack Auth backend API')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, cleanupOpenApiDoc(openApiDoc));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
