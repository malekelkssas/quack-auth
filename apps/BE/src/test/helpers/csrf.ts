import type { INestApplication } from '@nestjs/common';
import { CSRF_CONSTANTS } from '@shared/constants';
import type { Test } from 'supertest';
import { resolveCsrfCookieName } from '../../app/csrf.config';
import { parseSetCookie, toCookieHeader } from './cookies';
import { api, API_PATHS } from './request';

export type CsrfBundle = {
  token: string;
  cookies: Record<string, string>;
};

/** Bootstrap CSRF double-submit cookie via a safe GET (matches FE first-load flow). */
export async function fetchCsrf(app: INestApplication): Promise<CsrfBundle> {
  const response = await api(app)
    .get(`${API_PATHS.root}?name=csrf-bootstrap`)
    .expect(200);
  const cookies = parseSetCookie(response.headers['set-cookie']);
  const cookieName = resolveCsrfCookieName();
  const token = cookies[cookieName];

  if (!token) {
    throw new Error(`Missing CSRF cookie "${cookieName}" after bootstrap GET`);
  }

  return { token, cookies: { [cookieName]: token } };
}

/** Attach CSRF header + cookies to a Supertest request (merges optional auth cookies). */
export function withCsrf(
  test: Test,
  csrf: CsrfBundle,
  extraCookies: Record<string, string> = {},
): Test {
  return test
    .set(CSRF_CONSTANTS.HEADER_NAME, csrf.token)
    .set('Cookie', toCookieHeader({ ...csrf.cookies, ...extraCookies }));
}
