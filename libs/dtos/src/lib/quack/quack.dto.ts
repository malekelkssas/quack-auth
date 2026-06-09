import { z } from 'zod';
import { sanitizePlainText } from '../sanitize';

/** Optional display name for `POST /api/quack`; falls back to stored user name. */
export const QuackInput = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .transform(sanitizePlainText)
    .optional(),
});

export type QuackInput = z.infer<typeof QuackInput>;
