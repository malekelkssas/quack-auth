import { z } from 'zod';

/** Mirror of the persisted `User` Mongoose model (`mongoose/models/user/`). */
export const User = z.object({
  email: z.email('A valid email is required'),
  name: z
    .string('Name is required')
    .min(3, 'Name must be at least 3 characters'),
  password: z.string('Password hash is required'),
});

export type User = z.infer<typeof User>;
