import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import { ENV_KEYS, NODE_ENV } from '@shared/constants';

/** One year — production HSTS max-age per security hardening plan. */
const HSTS_MAX_AGE_SECONDS = 31_536_000;

function isProduction(): boolean {
  return process.env[ENV_KEYS.NODE_ENV] === NODE_ENV.PRODUCTION;
}

/** Security headers via helmet. Relaxed CSP outside production (Swagger /docs). */
export function configureHelmet(app: INestApplication): void {
  if (isProduction()) {
    app.use(
      helmet({
        hsts: {
          maxAge: HSTS_MAX_AGE_SECONDS,
          includeSubDomains: true,
        },
        frameguard: { action: 'deny' },
        noSniff: true,
      }),
    );
    return;
  }

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
}
