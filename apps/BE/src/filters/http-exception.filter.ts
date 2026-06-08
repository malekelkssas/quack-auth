import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';
import { fromZodError } from '../utils/error-response.util';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    if (
      exception instanceof ZodValidationException ||
      exception instanceof ZodSerializationException
    ) {
      const zodError = exception.getZodError();

      if (zodError instanceof ZodError) {
        this.logger.warn(
          `${exception.constructor.name}: ${zodError.issues.map((i) => i.message).join('; ')}`,
        );
      }

      const response = host.switchToHttp().getResponse();
      const status = exception.getStatus();
      const body =
        zodError instanceof ZodError
          ? fromZodError(zodError)
          : { message: 'Validation failed' };

      response.status(status).json(body);
      return;
    }

    super.catch(exception, host);
  }
}
