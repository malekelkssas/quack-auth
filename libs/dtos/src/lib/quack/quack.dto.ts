import { z } from 'zod';

const MAX_NAME_LENGTH = 100;

/**
 * Optional display name for `POST /api/quack`; falls back to the stored user
 * name when omitted. The BE additionally sanitizes plain text via its own
 * `name.schema`; on this branch the wire-shape mirror keeps just the length
 * rules so the FE can validate before sending.
 */
export const QuackInput = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(MAX_NAME_LENGTH, `Name must be at most ${MAX_NAME_LENGTH} characters`)
    .optional(),
});

export type QuackInput = z.infer<typeof QuackInput>;
