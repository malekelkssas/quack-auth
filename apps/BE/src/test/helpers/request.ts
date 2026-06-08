import type { INestApplication } from '@nestjs/common';
import { BE_ROUTES } from '@shared/constants';
import request from 'supertest';

/** Join path segments for routes under the global API prefix (no `/api` — use {@link api}). */
export function apiPath(...segments: string[]): string {
  const path = segments.filter(Boolean).join('/');
  return path ? `/${path}` : '/';
}

/** Common route paths — mirror production `@Controller` / `@Get` / `@Post` segments. */
export const API_PATHS = {
  root: apiPath(),
  users: {
    signup: apiPath(BE_ROUTES.USERS, BE_ROUTES.SIGNUP),
  },
} as const;

/** Full path including global prefix (for `describe` titles and logging). */
export function fullApiPath(...segments: string[]): string {
  return apiPath(BE_ROUTES.BASE, ...segments);
}

/** Supertest client scoped to the global API prefix (`/api`). */
export function api(app: INestApplication) {
  const server = app.getHttpServer();
  const basePath = `/${BE_ROUTES.BASE}`;

  return {
    get: (path: string) =>
      request(server)
        .get(`${basePath}${path}`)
        .set('Accept', 'application/json'),
    post: (path: string) =>
      request(server)
        .post(`${basePath}${path}`)
        .set('Accept', 'application/json'),
  };
}
