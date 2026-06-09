import { AsyncLocalStorage } from 'node:async_hooks';
import mongoose, { type ClientSession } from 'mongoose';

const mongoTransactionStorage = new AsyncLocalStorage<ClientSession>();

/** Active MongoDB session when a service method runs inside `@MongoTransaction()`. */
export function getMongoTransactionSession(): ClientSession | undefined {
  return mongoTransactionStorage.getStore();
}

/**
 * Runs a callback inside a MongoDB transaction and binds `session` for repositories
 * via {@link getMongoTransactionSession}.
 */
export async function runInMongoTransaction<T>(
  callback: () => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession();

  try {
    let result: T | undefined;

    await session.withTransaction(async () => {
      result = await mongoTransactionStorage.run(session, callback);
    });

    if (result === undefined) {
      throw new Error('Mongo transaction callback did not return a value');
    }

    return result;
  } finally {
    await session.endSession();
  }
}
