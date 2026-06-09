import type { ErrorResponse } from '@shared/dtos';

/** Normalize RTK Query mutation/query errors from `axiosBaseQuery`. */
export function toErrorResponse(error: unknown): ErrorResponse | null {
  if (!error) return null;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ErrorResponse).message === 'string'
  ) {
    return error as ErrorResponse;
  }
  return { message: 'An unknown error occurred' };
}
