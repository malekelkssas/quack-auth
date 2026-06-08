import mongoose from 'mongoose';
import { ENV_KEYS, NODE_ENV } from '@shared/constants';

export const dbClient = async () => {
  try {
    let mongoUri: string | undefined;

    if (process.env[ENV_KEYS.NODE_ENV] === NODE_ENV.E2E) {
      mongoUri = process.env[ENV_KEYS.E2E_MONGODB_URI];
    } else {
      mongoUri = process.env[ENV_KEYS.MONGODB_URI];
    }

    if (!mongoUri) {
      throw new Error(
        `MongoDB connection string is not set for current NODE_ENV: ${
          process.env[ENV_KEYS.NODE_ENV]
        }`,
      );
    }

    const dbName = process.env[ENV_KEYS.MONGODB_DATABASE];
    await mongoose.connect(mongoUri, { dbName });

    if (process.env[ENV_KEYS.NODE_ENV] === NODE_ENV.DEVELOPMENT) {
      console.log('Connected to MongoDB');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
