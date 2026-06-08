/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BE_ROUTES } from '@shared/constants';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { dbClient } from '@quack/mongoose/client';
import { AppModule } from './app/app.module';
import { configureApp } from './app/configure-app';

async function bootstrap() {
  await dbClient();

  const app = await NestFactory.create(AppModule);
  configureApp(app);
  const globalPrefix = BE_ROUTES.BASE;

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
