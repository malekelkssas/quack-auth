import { z } from 'zod';
import { OptionalPlainTextName } from '../user/name.schema';

/** Optional display name for `POST /api/quack`; falls back to stored user name. */
export const QuackInput = z.object({
  name: OptionalPlainTextName,
});

export type QuackInput = z.infer<typeof QuackInput>;
