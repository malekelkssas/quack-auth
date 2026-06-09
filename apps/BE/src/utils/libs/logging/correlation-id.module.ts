import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { correlationIdMiddleware } from '../../../middleware/correlation-id.middleware';

/** Registers correlation ID middleware before `nestjs-pino` request logging. */
@Module({})
export class CorrelationIdModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(correlationIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
