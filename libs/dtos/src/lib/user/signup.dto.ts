import { z } from 'zod';
import { PlainTextName } from './name.schema';
import { Password } from './password.schema';

/**
 * Signup input — plaintext password; hashing happens in the Mongoose layer.
 * `name` max length enforced via `PlainTextName`; `password` max via `Password`.
 */
export const Signup = z.object({
  email: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.email('A valid email is required'),
  ),
  name: PlainTextName,
  password: Password,
});

export type Signup = z.infer<typeof Signup>;
