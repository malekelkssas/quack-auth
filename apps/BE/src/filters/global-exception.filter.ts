import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { API_ERROR_CODES } from '@shared/constants';
import {
  fromHttpException,
  fromZodError,
  getZodErrorFromException,
  isHttpExceptionLike,
  isPayloadTooLargeError,
  toErrorResponse,
} from '../utils/error-response.util';
import { MongooseErrorHandler } from '../utils/mongoose-error.handler.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (isHttpExceptionLike(exception)) {
      this.sendHttpException(response, exception);
      return;
    }

    if (isPayloadTooLargeError(exception)) {
      response
        .status(HttpStatus.PAYLOAD_TOO_LARGE)
        .json(
          toErrorResponse(
            'Request body too large',
            API_ERROR_CODES.PAYLOAD_TOO_LARGE,
          ),
        );
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
    const zodError = getZodErrorFromException(exception);

    if (zodError) {
      const first = zodError.issues[0];
      if (first) {
        this.logger.warn(`${exception.constructor.name}: ${first.message}`);
      }

      response.status(status).json(fromZodError(zodError));
      return;
    }

    response.status(status).json(fromHttpException(exception));
  }
}
