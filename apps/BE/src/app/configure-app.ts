import type { INestApplication } from '@nestjs/common';
import cookieParser = require('cookie-parser');
import { BE_ROUTES, ENV_KEYS } from '@shared/constants';
import { configureBodyParser } from './body-parser.config';
import { configureCsrf } from './csrf.config';
import { configureHelmet } from './helmet.config';

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
  // CORS first so preflight and middleware 403s (e.g. CSRF) still get ACAO headers.
  app.enableCors({
    origin: resolveCorsOrigins(),
    credentials: true,
  });
  configureBodyParser(app);
  app.use(cookieParser());
  configureHelmet(app);
  configureCsrf(app);
  app.setGlobalPrefix(BE_ROUTES.BASE);
}
