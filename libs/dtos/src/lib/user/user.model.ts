import { z } from 'zod';

/** Mirror of the persisted `User` Mongoose model (`mongoose/models/user/`). */
export const User = z.object({
  _id: z.string(),
  email: z.email('A valid email is required'),
  name: z
    .string('Name is required')
    .min(3, 'Name must be at least 3 characters'),
  password: z.string('Password hash is required'),
  refreshTokenHash: z.string().optional(),
  refreshTokenRotatedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof User>;
