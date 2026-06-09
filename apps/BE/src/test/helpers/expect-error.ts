import type { Response } from 'supertest';

/** Assert user-facing {@link ErrorResponse} from GlobalExceptionFilter (status via Supertest `.expect()`). */
export function expectApiError(
  response: Response,
  message: string,
  code?: string,
): void {
  expect(response.body.message).toBe(message);
  if (code !== undefined) {
    expect(response.body.code).toBe(code);
  }
}
