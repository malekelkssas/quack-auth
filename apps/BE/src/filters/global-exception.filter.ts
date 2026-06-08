import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';
import { fromHttpException, fromZodError } from '../utils/error-response.util';
import { MongooseErrorHandler } from '../utils/mongoose-error.handler.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      this.sendHttpException(response, exception);
      return;
    }

    const mongooseException = MongooseErrorHandler.transformError(
      exception,
      'Internal server error',
    );

    if (mongooseException) {
      this.sendHttpException(response, mongooseException);
      return;
    }

    const request = host.switchToHttp().getRequest();

    const label =
      exception instanceof Error
        ? `${exception.constructor.name}: ${exception.message}`
        : String(exception);

    this.logger.error(
      `${request.method} ${request.url} — ${label}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
    });
  }

  private sendHttpException(
    response: { status: (code: number) => { json: (body: unknown) => void } },
    exception: HttpException,
  ): void {
    const status = exception.getStatus();

    if (
      exception instanceof ZodValidationException ||
      exception instanceof ZodSerializationException
    ) {
      const zodError = exception.getZodError();

      if (zodError instanceof ZodError) {
        const first = zodError.issues[0];
        if (first) {
          this.logger.warn(`${exception.constructor.name}: ${first.message}`);
        }
      }

      const body =
        zodError instanceof ZodError
          ? fromZodError(zodError)
          : { message: 'Validation failed' };

      response.status(status).json(body);
      return;
    }

    response.status(status).json(fromHttpException(exception));
  }
}
