import { ENV_KEYS, NODE_ENV } from '@shared/constants';

export type MongoConnectionOptions = {
  uri: string;
  dbName?: string;
};

/** Shared URI resolution for `dbClient()` and Nest `MongooseModule.forRootAsync`. */
export function resolveMongoConnectionOptions(): MongoConnectionOptions {
  const nodeEnv = process.env[ENV_KEYS.NODE_ENV];
  const mongoUri =
    nodeEnv === NODE_ENV.E2E
      ? process.env[ENV_KEYS.E2E_MONGODB_URI]
      : process.env[ENV_KEYS.MONGODB_URI];

  if (!mongoUri) {
    throw new Error(
      `MongoDB connection string is not set for current NODE_ENV: ${nodeEnv ?? 'undefined'}`,
    );
  }

  const dbName = process.env[ENV_KEYS.MONGODB_DATABASE];

  return dbName ? { uri: mongoUri, dbName } : { uri: mongoUri };
}
