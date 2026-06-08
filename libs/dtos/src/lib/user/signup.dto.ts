import { z } from 'zod';
import { Password } from './password.schema';

/** Signup input — plaintext password; hashing happens before persistence. */
export const Signup = z.object({
  email: z.email('A valid email is required'),
  name: z
    .string('Name is required')
    .min(3, 'Name must be at least 3 characters'),
  password: Password,
});

export type Signup = z.infer<typeof Signup>;
