import type { INestApplication } from '@nestjs/common';
import {
  API_ERROR_CODES,
  BE_ROUTES,
  CSRF_CONSTANTS,
  ENV_KEYS,
  NODE_ENV,
} from '@shared/constants';
import { doubleCsrf } from 'csrf-csrf';
import { resolveAuthSecret } from '../utils/auth-config.util';

type CsrfRequest = {
  path?: string;
  url: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
};

const CSRF_PROTECTED_PATHS = new Set([`/${BE_ROUTES.BASE}/${BE_ROUTES.QUACK}`]);

export function resolveCsrfCookieName(): string {
  return (
    process.env[ENV_KEYS.AUTH_CSRF_COOKIE_NAME]?.trim() ||
    CSRF_CONSTANTS.DEFAULT_COOKIE_NAME
  );
}

function isCsrfProtectedRoute(req: CsrfRequest): boolean {
  const path = req.path || req.url.split('?')[0] || '';
  return CSRF_PROTECTED_PATHS.has(path);
}

function parseSameSite(
  value: string | undefined,
): 'strict' | 'lax' | 'none' | boolean {
  const normalized = value?.trim().toLowerCase();
  if (
    normalized === 'strict' ||
    normalized === 'lax' ||
    normalized === 'none'
  ) {
    return normalized;
  }

  return 'lax';
}

/** Wire double-submit CSRF for authenticated mutations (not public auth POSTs). Requires cookie-parser first. */
export function configureCsrf(app: INestApplication): void {
  const csrfSecret = resolveAuthSecret(
    ENV_KEYS.AUTH_CSRF_SECRET,
    'dev-csrf-secret',
  );
  const cookieName = resolveCsrfCookieName();
  const secure = process.env[ENV_KEYS.NODE_ENV] === NODE_ENV.PRODUCTION;

  const { doubleCsrfProtection, generateCsrfToken, invalidCsrfTokenError } =
    doubleCsrf({
      getSecret: () => csrfSecret,
      getSessionIdentifier: (req) => (req as CsrfRequest).ip ?? 'anonymous',
      cookieName,
      cookieOptions: {
        sameSite: parseSameSite(process.env[ENV_KEYS.AUTH_COOKIE_SAME_SITE]),
        path: '/',
        secure,
        httpOnly: false,
      },
      ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
      getCsrfTokenFromRequest: (req) => {
        const header = (req as CsrfRequest).headers[CSRF_CONSTANTS.HEADER_NAME];
        return typeof header === 'string' ? header : undefined;
      },
      skipCsrfProtection: (req) => !isCsrfProtectedRoute(req as CsrfRequest),
    });

  app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      // csrf-csrf types target Express 4; Nest uses Express 5 request types.
      generateCsrfToken(req as never, res as never);
    }
    next();
  });

  app.use(doubleCsrfProtection);

  app.use((error: unknown, _req, res, next): void => {
    if (error === invalidCsrfTokenError) {
      res.status(403).json({
        message: 'invalid csrf token',
        code: API_ERROR_CODES.INVALID_CSRF_TOKEN,
      });
      return;
    }

    next(error);
  });
}
