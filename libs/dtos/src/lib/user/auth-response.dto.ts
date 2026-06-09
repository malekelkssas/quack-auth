import { z } from 'zod';
import { User } from './user.model';

/** Safe user shape for auth API responses — no password or refresh metadata. */
export const AuthUser = User.pick({
  _id: true,
  email: true,
  name: true,
}).extend({
  /** ISO-8601 strings for JSON/OpenAPI — persisted `User` model keeps `z.coerce.date()`. */
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const AuthResponse = z.object({
  user: AuthUser,
});

export type AuthUser = z.infer<typeof AuthUser>;
export type AuthResponse = z.infer<typeof AuthResponse>;
