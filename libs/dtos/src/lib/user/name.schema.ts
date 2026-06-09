import { z } from 'zod';
import { sanitizePlainText } from '../sanitize';

export const MAX_NAME_LENGTH = 100;

const nameLength = z
  .string()
  .min(3, 'Name must be at least 3 characters')
  .max(MAX_NAME_LENGTH, `Name must be at most ${MAX_NAME_LENGTH} characters`);

/** Plain-text display name — strip HTML first, then enforce length. */
export const PlainTextName = z
  .string('Name is required')
  .transform(sanitizePlainText)
  .pipe(nameLength);

/** Optional override for `POST /api/quack`. */
export const OptionalPlainTextName = z
  .string()
  .transform(sanitizePlainText)
  .pipe(nameLength)
  .optional();
