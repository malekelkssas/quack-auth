import type { ErrorResponse } from '@shared/dtos';
import { HttpException } from '@nestjs/common';
import { ZodError } from 'zod';

export function toErrorResponse(message: string, code?: string): ErrorResponse {
  return code ? { message, code } : { message };
}

/** Map a Nest {@link HttpException} body to {@link ErrorResponse}. */
export function fromHttpException(exception: HttpException): ErrorResponse {
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return toErrorResponse(response);
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'message' in response
  ) {
    const { message } = response as { message?: string | string[] };
    if (typeof message === 'string') {
      return toErrorResponse(message);
    }
    if (Array.isArray(message) && typeof message[0] === 'string') {
      return toErrorResponse(message[0]);
    }
  }

  return toErrorResponse('Request failed');
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
