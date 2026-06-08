import type { Response } from 'supertest';

/** Assert exact user-facing `message` from GlobalExceptionFilter (status via Supertest `.expect()`). */
export function expectApiError(response: Response, message: string): void {
  expect(response.body.message).toBe(message);
}
