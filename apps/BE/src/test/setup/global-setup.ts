import { MongoMemoryServer } from 'mongodb-memory-server';

// Literal env keys — Jest globalSetup runs outside moduleNameMapper (must match ENV_KEYS / NODE_ENV.E2E).
export default async function globalSetup(): Promise<void> {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  process.env.NODE_ENV = 'e2e';
  process.env.E2E_MONGODB_URI = mongoUri;
  process.env.MONGODB_DATABASE = 'quack-auth-test';

  (globalThis as { __MONGO_SERVER__?: MongoMemoryServer }).__MONGO_SERVER__ =
    mongoServer;
}
