import type { ErrorResponse } from '@shared/dtos';
import { ZodError } from 'zod';

export function toErrorResponse(message: string, code?: string): ErrorResponse {
  return code ? { message, code } : { message };
}

/** Map a Zod error to {@link ErrorResponse} using only the first issue. */
export function fromZodError(
  zodError: ZodError,
  fallbackMessage = 'Validation failed',
): ErrorResponse {
  const first = zodError.issues[0];
  if (!first) {
    return { message: fallbackMessage };
  }

  return toErrorResponse(first.message, first.code);
}
