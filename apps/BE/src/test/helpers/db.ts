import { loadFixtures } from '@quack/mongoose/fixtures';

/** Reset users collection and seed shared fixture data (Argon2-hashed via pre-save). */
export async function resetDb(): Promise<void> {
  await loadFixtures({ reset: true });
}
