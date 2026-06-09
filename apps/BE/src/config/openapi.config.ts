import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CSRF_CONSTANTS, ENV_KEYS } from '@shared/constants';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { resolveCsrfCookieName } from './csrf.config';

export const OPENAPI_ACCESS_COOKIE = 'accessCookie';
export const OPENAPI_CSRF_HEADER = 'csrfHeader';

export function setupOpenApi(app: INestApplication): void {
  const accessCookieName =
    process.env[ENV_KEYS.AUTH_ACCESS_COOKIE_NAME] ?? 'qa_access_token';
  const csrfCookieName = resolveCsrfCookieName();

  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Quack Auth API')
      .setDescription(
        'Quack Auth backend API. Auth uses HttpOnly JWT cookies — not Bearer tokens. Protected mutations on `/api/quack` also require CSRF double-submit (`x-csrf-token` header + CSRF cookie).',
      )
      .setVersion('1.0')
      .addApiKey(
        {
          type: 'apiKey',
          in: 'cookie',
          name: accessCookieName,
          description: `HttpOnly access JWT cookie (default: ${accessCookieName})`,
        },
        OPENAPI_ACCESS_COOKIE,
      )
      .addApiKey(
        {
          type: 'apiKey',
          in: 'header',
          name: CSRF_CONSTANTS.HEADER_NAME,
          description: `CSRF double-submit header — pair with ${csrfCookieName} cookie`,
        },
        OPENAPI_CSRF_HEADER,
      )
      .build(),
  );

  SwaggerModule.setup('docs', app, cleanupOpenApiDoc(openApiDoc));
}
