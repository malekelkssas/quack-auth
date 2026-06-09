import mongoose from 'mongoose';
import type { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalTeardown(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  const mongoServer = (globalThis as { __MONGO_SERVER__?: MongoMemoryServer })
    .__MONGO_SERVER__;

  if (mongoServer) {
    await mongoServer.stop();
  }
}
