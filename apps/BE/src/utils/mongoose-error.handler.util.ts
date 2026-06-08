import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { isHttpExceptionLike } from './error-response.util';

/**
 * Maps Mongoose/MongoDB driver errors to NestJS HTTP exceptions.
 * Use in services via {@link rethrow}; {@link GlobalExceptionFilter} calls {@link transformError}.
 */
export class MongooseErrorHandler {
  private static readonly logger = new Logger(MongooseErrorHandler.name);

  /**
   * Transform a caught error into an HTTP exception, or return null if not Mongoose/Mongo-related.
   */
  static transformError(
    error: unknown,
    fallbackMessage: string,
  ): HttpException | null {
    if (error instanceof mongoose.Error.ValidationError) {
      const firstKey = Object.keys(error.errors)[0];
      const firstMessage =
        (firstKey && error.errors[firstKey]?.message) ??
        'Validation failed. Please check your input.';
      return new BadRequestException(firstMessage);
    }

    if (error instanceof mongoose.Error.CastError) {
      return new BadRequestException(
        `Invalid value for ${error.path ?? 'field'}. Please check your input.`,
      );
    }

    if (error instanceof mongoose.Error.DocumentNotFoundError) {
      return new NotFoundException('The requested document was not found.');
    }

    if (error instanceof mongoose.Error.VersionError) {
      return new ConflictException(
        'The document was modified by another request. Please retry.',
      );
    }

    if (error instanceof mongoose.Error.StrictModeError) {
      return new BadRequestException(
        `Unknown field "${error.path ?? 'field'}" is not allowed.`,
      );
    }

    if (error instanceof mongoose.mongo.MongoServerError) {
      return this.handleMongoServerError(error, fallbackMessage);
    }

    if (
      error instanceof mongoose.Error.MongooseServerSelectionError ||
      error instanceof mongoose.mongo.MongoNetworkError
    ) {
      return new ServiceUnavailableException(
        'Database is temporarily unavailable. Please try again later.',
      );
    }

    if (error instanceof mongoose.Error) {
      return new BadRequestException(
        'Database operation failed. Please check your input.',
      );
    }

    return null;
  }

  /**
   * Transform and throw — use in `catch` blocks.
   */
  static rethrow(
    error: unknown,
    fallbackMessage: string,
    context?: string,
  ): never {
    if (isHttpExceptionLike(error)) {
      throw error;
    }

    const httpException =
      this.transformError(error, fallbackMessage) ??
      new InternalServerErrorException(fallbackMessage);

    this.logError(error, httpException, fallbackMessage, context);
    throw httpException;
  }

  private static handleMongoServerError(
    error: mongoose.mongo.MongoServerError,
    fallbackMessage: string,
  ): HttpException {
    switch (error.code) {
      case 11000:
      case 11001:
        return new ConflictException(this.duplicateKeyMessage(error));
      case 121:
        return new BadRequestException(
          'Document failed validation. Please check your input.',
        );
      case 13:
      case 18:
        return new ServiceUnavailableException(
          'Database is temporarily unavailable. Please try again later.',
        );
      default:
        return new InternalServerErrorException(fallbackMessage);
    }
  }

  private static duplicateKeyMessage(
    error: mongoose.mongo.MongoServerError,
  ): string {
    const keyValue = error.keyValue as Record<string, unknown> | undefined;
    const field = keyValue ? Object.keys(keyValue)[0] : undefined;

    if (field === 'email') {
      return 'Email is already registered';
    }

    if (field) {
      return `A record with this ${field} already exists`;
    }

    return 'A record with these values already exists';
  }

  private static logError(
    original: unknown,
    transformed: HttpException,
    fallbackMessage: string,
    context?: string,
  ): void {
    const status = transformed.getStatus();
    const prefix = context ? `[${context}] ` : '';
    const message =
      original instanceof Error ? original.message : String(original);

    if (status >= 500) {
      this.logger.error(
        `${prefix}${fallbackMessage}: ${message}`,
        original instanceof Error ? original.stack : undefined,
      );
    }
  }
}
