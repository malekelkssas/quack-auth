import type { Response } from 'supertest';

/**
 * Assert an API error response from {@link GlobalExceptionFilter}.
 * Body shape is `{ message: string; code?: string }` — tests assert the user-facing `message` only.
 */
export function expectApiError(
  response: Response,
  status: number,
  message: string,
): void {
  expect(response.status).toBe(status);
  expect(response.body.message).toBe(message);
}
