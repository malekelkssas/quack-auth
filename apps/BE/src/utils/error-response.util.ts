import type { ErrorResponse } from '@shared/dtos';
import { HttpException } from '@nestjs/common';
import type { ZodError } from 'zod';

/** Nest HTTP exceptions from bundled deps may fail `instanceof HttpException`. */
export function isHttpExceptionLike(
  exception: unknown,
): exception is HttpException {
  return (
    typeof exception === 'object' &&
    exception !== null &&
    'getStatus' in exception &&
    'getResponse' in exception &&
    typeof (exception as HttpException).getStatus === 'function' &&
    typeof (exception as HttpException).getResponse === 'function'
  );
}

/** Zod pipe/serializer errors expose `getZodError()` (nestjs-zod). */
export function getZodErrorFromException(exception: unknown): ZodError | null {
  if (
    typeof exception !== 'object' ||
    exception === null ||
    !('getZodError' in exception) ||
    typeof (exception as { getZodError: () => unknown }).getZodError !==
      'function'
  ) {
    return null;
  }

  const zodError = (exception as { getZodError: () => unknown }).getZodError();
  if (
    typeof zodError !== 'object' ||
    zodError === null ||
    !('issues' in zodError) ||
    !Array.isArray((zodError as ZodError).issues)
  ) {
    return null;
  }

  return zodError as ZodError;
}

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

/** Map a Zod issues object to {@link ErrorResponse} using only the first issue. */
export function fromZodError(
  zodError: Pick<ZodError, 'issues'>,
  fallbackMessage = 'Validation failed',
): ErrorResponse {
  const first = zodError.issues[0];
  if (!first) {
    return { message: fallbackMessage };
  }

  return toErrorResponse(first.message, first.code);
}
