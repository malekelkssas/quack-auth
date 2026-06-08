import type { INestApplication } from '@nestjs/common';
import { BE_ROUTES } from '@shared/constants';

/** Shared HTTP config for production and API tests (excludes Swagger and listen). */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(BE_ROUTES.BASE);
}
