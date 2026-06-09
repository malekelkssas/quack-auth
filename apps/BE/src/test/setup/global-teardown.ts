import mongoose from 'mongoose';
import type { MongoMemoryReplSet } from 'mongodb-memory-server';

export default async function globalTeardown(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  const mongoReplSet = (
    globalThis as { __MONGO_REPLSET__?: MongoMemoryReplSet }
  ).__MONGO_REPLSET__;

  if (mongoReplSet) {
    await mongoReplSet.stop();
  }
}
