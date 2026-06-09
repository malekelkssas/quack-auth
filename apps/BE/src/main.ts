/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { BE_ROUTES } from '@shared/constants';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app/app.module';
import { configureApp } from './config/configure-app';
import { setupOpenApi } from './config/openapi.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  app.useLogger(app.get(Logger));
  configureApp(app);
  setupOpenApi(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  const logger = app.get(Logger);
  logger.log(
    `Application is running on: http://localhost:${port}/${BE_ROUTES.BASE}`,
  );
  logger.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
