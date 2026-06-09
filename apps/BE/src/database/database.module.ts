import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { resolveMongoConnectionOptions } from '@quack/mongoose/connection-options';

/**
 * Nest connection wiring via `@nestjs/mongoose`. Repositories keep using
 * `UserModel` from `@quack/mongoose/models/user` on the default connection.
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const { uri, dbName } = resolveMongoConnectionOptions();
        return { uri, ...(dbName ? { dbName } : {}) };
      },
    }),
  ],
})
export class DatabaseModule {}
