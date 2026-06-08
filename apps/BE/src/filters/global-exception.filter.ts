import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MongooseErrorHandler } from '../utils/mongoose-error.handler.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      const response = host.switchToHttp().getResponse();
      const status = exception.getStatus();
      const body = exception.getResponse();
      response
        .status(status)
        .json(
          typeof body === 'string'
            ? { statusCode: status, message: body }
            : body,
        );
      return;
    }

    const mongooseException = MongooseErrorHandler.toHttpException(
      exception,
      'Internal server error',
    );

    if (mongooseException) {
      const response = host.switchToHttp().getResponse();
      const status = mongooseException.getStatus();
      const body = mongooseException.getResponse();
      response
        .status(status)
        .json(
          typeof body === 'string'
            ? { statusCode: status, message: body }
            : body,
        );
      return;
    }

    const response = host.switchToHttp().getResponse();
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
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
