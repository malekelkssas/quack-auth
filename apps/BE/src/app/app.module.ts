import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ENV_KEYS } from '@shared/constants';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from '../auth/auth.module';
import { GlobalExceptionFilter } from '../filters/global-exception.filter';
import { QuackModule } from '../quack/quack.module';
import { UsersModule } from '../users/users.module';
import { resolvePositiveIntEnv } from '../utils/auth-config.util';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const DEFAULT_AUTH_THROTTLE_TTL_MS = 60_000;
const DEFAULT_AUTH_THROTTLE_LIMIT = 10;

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: resolvePositiveIntEnv(
              ENV_KEYS.AUTH_THROTTLE_TTL_MS,
              DEFAULT_AUTH_THROTTLE_TTL_MS,
            ),
            limit: resolvePositiveIntEnv(
              ENV_KEYS.AUTH_THROTTLE_LIMIT,
              DEFAULT_AUTH_THROTTLE_LIMIT,
            ),
          },
        ],
      }),
    }),
    AuthModule,
    QuackModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
