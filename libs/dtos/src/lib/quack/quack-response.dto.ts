import { z } from 'zod';

/** `POST /api/quack` success body — e.g. `{ quack: "Jane quack" }`. */
export const QuackResponse = z.object({
  quack: z.string(),
});

export type QuackResponse = z.infer<typeof QuackResponse>;
