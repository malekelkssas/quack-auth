import * as argon2 from 'argon2';

/** OWASP minimum: 19 MiB memory, 2 iterations, parallelism 1 (argon2id). */
export const ARGON2_OPTIONS: argon2.Options & { raw?: false } = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export function isArgon2Hash(value: string): boolean {
  return value.startsWith('$argon2');
}

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}
