import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { BE_ROUTES } from '@shared/constants';
import { dbClient } from '@quack/mongoose/client';
import { AppModule } from './app/app.module';
import { configureApp } from './config/configure-app';
import { setupOpenApi } from './config/openapi.config';

async function bootstrap() {
  // Match test bootstrap: connect before Nest loads bundled `@quack/mongoose` models.
  await dbClient();

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  configureApp(app);
  setupOpenApi(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `Application is running on: http://localhost:${port}/${BE_ROUTES.BASE}`,
  );
  Logger.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  Logger.error(
    `Bootstrap failed: ${message}`,
    error instanceof Error ? error.stack : undefined,
  );
  process.exit(1);
});
