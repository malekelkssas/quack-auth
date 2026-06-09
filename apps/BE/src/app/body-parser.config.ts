import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ENV_KEYS } from '@shared/constants';

const DEFAULT_JSON_BODY_LIMIT = '100kb';

export function resolveJsonBodyLimit(): string {
  const fromEnv = process.env[ENV_KEYS.BE_JSON_BODY_LIMIT]?.trim();
  return fromEnv || DEFAULT_JSON_BODY_LIMIT;
}

/** Register JSON / urlencoded parsers with env-configurable size limit. Requires `bodyParser: false` on app create. */
export function configureBodyParser(app: INestApplication): void {
  const nestApp = app as NestExpressApplication;
  const limit = resolveJsonBodyLimit();

  nestApp.useBodyParser('json', { limit });
  nestApp.useBodyParser('urlencoded', { extended: true, limit });
}
