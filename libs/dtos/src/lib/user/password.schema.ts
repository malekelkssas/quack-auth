import { z } from 'zod';

/** Upper bound for signup/login plaintext password (DoS / abuse guard). */
export const MAX_PASSWORD_LENGTH = 128;

export const Password = z
  .string('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(
    MAX_PASSWORD_LENGTH,
    `Password must be at most ${MAX_PASSWORD_LENGTH} characters`,
  )
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^a-zA-Z0-9]/,
    'Password must contain at least one special character',
  );

export type Password = z.infer<typeof Password>;
