import { z } from 'zod';
import { Password } from './password.schema';

export const Login = z.object({
  email: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.email('A valid email is required'),
  ),
  password: Password,
});

export type Login = z.infer<typeof Login>;
