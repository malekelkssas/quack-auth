import { z } from 'zod';

export const GreetingQuery = z.object({
  name: z.string("Name is required").min(1),
});

export type GreetingQuery = z.infer<typeof GreetingQuery>;

export const GreetingResponse = z.object({
  name: z.string().min(3),
  appName: z.string(),
});

export type GreetingResponse = z.infer<typeof GreetingResponse>;
