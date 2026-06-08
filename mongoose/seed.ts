import mongoose from 'mongoose';
import { dbClient } from './client';
import { loadFixtures } from './fixtures';

async function main(): Promise<void> {
  const reset = process.argv.includes('--reset');

  await dbClient();
  try {
    const users = await loadFixtures({ reset });
    console.log(
      `Seeded ${users.length} user(s)${reset ? ' (collections reset)' : ''}.`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
