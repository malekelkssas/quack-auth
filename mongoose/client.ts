import mongoose from 'mongoose';
import { ENV_KEYS, NODE_ENV } from '@shared/constants';
import { resolveMongoConnectionOptions } from './connection-options';

export { resolveMongoConnectionOptions } from './connection-options';

/** CLI / seed scripts — Nest BE uses `DatabaseModule` (`MongooseModule.forRootAsync`). */
export const dbClient = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const { uri, dbName } = resolveMongoConnectionOptions();
    await mongoose.connect(uri, dbName ? { dbName } : undefined);

    if (process.env[ENV_KEYS.NODE_ENV] === NODE_ENV.DEVELOPMENT) {
      console.log('Connected to MongoDB');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
