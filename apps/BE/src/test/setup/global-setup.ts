import { MongoMemoryReplSet } from 'mongodb-memory-server';

// Literal env keys — Jest globalSetup runs outside moduleNameMapper (must match ENV_KEYS / NODE_ENV.E2E).
export default async function globalSetup(): Promise<void> {
  const mongoReplSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, name: 'rs0' },
  });
  const mongoUri = mongoReplSet.getUri();

  process.env.NODE_ENV = 'e2e';
  process.env.E2E_MONGODB_URI = mongoUri;
  process.env.MONGODB_DATABASE = 'quack-auth-test';
  // High limit so existing auth specs are not throttled (dedicated throttle spec sets a low limit).
  process.env.AUTH_THROTTLE_LIMIT = '1000';

  (globalThis as { __MONGO_REPLSET__?: MongoMemoryReplSet }).__MONGO_REPLSET__ =
    mongoReplSet;
}
