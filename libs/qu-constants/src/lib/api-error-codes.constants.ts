/** Stable API error `code` values for {@link ErrorResponse} from `@shared/dtos`. */
export const API_ERROR_CODES = {
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  INVALID_CSRF_TOKEN: 'INVALID_CSRF_TOKEN',
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
