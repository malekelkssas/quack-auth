import { loadFixtures } from '@quack/mongoose/fixtures';

export async function resetDb(): Promise<void> {
  await loadFixtures({ reset: true });
}
