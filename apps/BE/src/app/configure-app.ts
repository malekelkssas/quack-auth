import type { INestApplication } from '@nestjs/common';
import cookieParser = require('cookie-parser');
import { BE_ROUTES, ENV_KEYS } from '@shared/constants';

function resolveCorsOrigins(): string | string[] {
  const origins =
    process.env[ENV_KEYS.CORS_ORIGIN]
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];
  return origins.length > 0 ? origins : 'http://localhost:4200';
}

/** Shared HTTP config for production and API tests (excludes Swagger and listen). */
export function configureApp(app: INestApplication): void {
  app.use(cookieParser());
  app.setGlobalPrefix(BE_ROUTES.BASE);
  app.enableCors({
    origin: resolveCorsOrigins(),
    credentials: true,
  });
}
