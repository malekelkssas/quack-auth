/** Shared CSRF names for BE middleware and FE axios (double-submit cookie). */
export const CSRF_CONSTANTS = {
  HEADER_NAME: 'x-csrf-token',
  DEFAULT_COOKIE_NAME: 'qa_csrf_token',
} as const;
