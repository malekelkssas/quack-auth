import { CSRF_CONSTANTS, ENV_KEYS } from '@shared/constants';

export function resolveCsrfCookieName(): string {
  const fromEnv = import.meta.env[ENV_KEYS.VITE_CSRF_COOKIE_NAME]?.trim();
  return fromEnv || CSRF_CONSTANTS.DEFAULT_COOKIE_NAME;
}

/** Read a cookie value from `document.cookie` (CSRF cookie is not HttpOnly). */
export function readBrowserCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}
