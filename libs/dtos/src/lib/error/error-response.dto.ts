import { z } from 'zod';

export const ErrorResponse = z.object({
  message: z.string(),
  code: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponse>;
