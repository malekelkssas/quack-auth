import { z } from 'zod';

export const TestDto = z.object({
  name: z.string()
});

export type TestDto = z.infer<typeof TestDto>;