import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MongooseErrorHandler } from '../utils/mongoose-error.handler.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
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

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
