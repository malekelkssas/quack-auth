import type { Response } from 'supertest';

/** Cookie names — match `.env.example` / AuthService fallbacks. */
export const AUTH_COOKIE_NAMES = {
  access: process.env.AUTH_ACCESS_COOKIE_NAME ?? 'qa_access_token',
  refresh: process.env.AUTH_REFRESH_COOKIE_NAME ?? 'qa_refresh_token',
} as const;

/** Build a `Cookie` request header from name/value pairs. */
export function toCookieHeader(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

/** Parse `Set-Cookie` response headers into name → value (first segment only). */
export function parseSetCookie(
  setCookieHeaders: string | string[] | undefined,
): Record<string, string> {
  const headers = normalizeSetCookieHeaders(setCookieHeaders);
  const cookies: Record<string, string> = {};

  for (const header of headers) {
    const [pair] = header.split(';');
    const equalsIndex = pair.indexOf('=');
    if (equalsIndex <= 0) {
      continue;
    }

    const name = pair.slice(0, equalsIndex).trim();
    const value = pair.slice(equalsIndex + 1).trim();
    cookies[name] = value;
  }

  return cookies;
}

export function parseCookiesFromResponse(
  response: Pick<Response, 'headers'>,
): Record<string, string> {
  return parseSetCookie(response.headers['set-cookie']);
}

/** Assert both auth cookies are present with non-empty values. */
export function expectAuthCookiesSet(
  setCookieHeaders: string | string[] | undefined,
): Record<string, string> {
  const cookies = parseSetCookie(setCookieHeaders);

  expect(cookies[AUTH_COOKIE_NAMES.access]).toBeTruthy();
  expect(cookies[AUTH_COOKIE_NAMES.refresh]).toBeTruthy();

  return cookies;
}

/** Assert a cookie was cleared via `response.clearCookie` (empty value + past expiry). */
export function expectCookieCleared(
  setCookieHeaders: string | string[] | undefined,
  cookieName: string,
): void {
  const headers = normalizeSetCookieHeaders(setCookieHeaders);
  const header = headers.find((value) => value.startsWith(`${cookieName}=`));

  expect(header).toBeDefined();
  expect(header).toMatch(
    /Expires=Thu, 01 Jan 1970|Max-Age=0|=\s*;.*Expires=Thu, 01 Jan 1970/,
  );
}

export function expectAuthCookiesCleared(
  setCookieHeaders: string | string[] | undefined,
): void {
  expectCookieCleared(setCookieHeaders, AUTH_COOKIE_NAMES.access);
  expectCookieCleared(setCookieHeaders, AUTH_COOKIE_NAMES.refresh);
}

function normalizeSetCookieHeaders(
  setCookieHeaders: string | string[] | undefined,
): string[] {
  if (!setCookieHeaders) {
    return [];
  }

  return Array.isArray(setCookieHeaders)
    ? setCookieHeaders
    : [setCookieHeaders];
}
