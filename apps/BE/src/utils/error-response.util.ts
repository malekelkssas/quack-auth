import type { ErrorResponse } from '@shared/dtos';
import { API_ERROR_CODES } from '@shared/constants';
import { HttpException, HttpStatus } from '@nestjs/common';
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

/** Express body-parser `entity.too.large` (413) — not always an HttpException. */
export function isPayloadTooLargeError(exception: unknown): boolean {
  if (typeof exception !== 'object' || exception === null) {
    return false;
  }

  const err = exception as {
    type?: string;
    status?: number;
    statusCode?: number;
  };

  return (
    err.type === 'entity.too.large' ||
    err.status === HttpStatus.PAYLOAD_TOO_LARGE ||
    err.statusCode === HttpStatus.PAYLOAD_TOO_LARGE
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
  const status = exception.getStatus();

  if (status === HttpStatus.TOO_MANY_REQUESTS) {
    return toErrorResponse(
      'Too many requests',
      API_ERROR_CODES.TOO_MANY_REQUESTS,
    );
  }

  if (status === HttpStatus.PAYLOAD_TOO_LARGE) {
    return toErrorResponse(
      'Request body too large',
      API_ERROR_CODES.PAYLOAD_TOO_LARGE,
    );
  }

  const response = exception.getResponse();

  if (typeof response === 'string') {
    return toErrorResponse(response);
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'message' in response
  ) {
    const body = response as { message?: string | string[]; code?: string };
    if (typeof body.message === 'string') {
      return body.code
        ? toErrorResponse(body.message, body.code)
        : toErrorResponse(body.message);
    }
    if (Array.isArray(body.message) && typeof body.message[0] === 'string') {
      return toErrorResponse(body.message[0]);
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
