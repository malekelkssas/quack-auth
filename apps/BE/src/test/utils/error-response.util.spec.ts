import { API_ERROR_CODES } from '@shared/constants';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  fromHttpException,
  isPayloadTooLargeError,
  toErrorResponse,
} from '../../utils/error-response.util';

describe('error-response.util', () => {
  describe('fromHttpException', () => {
    it('maps 429 to ErrorResponse with TOO_MANY_REQUESTS code', () => {
      const exception = new HttpException(
        'ThrottlerException: Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );

      expect(fromHttpException(exception)).toEqual(
        toErrorResponse('Too many requests', API_ERROR_CODES.TOO_MANY_REQUESTS),
      );
    });

    it('maps 413 HttpException to ErrorResponse with PAYLOAD_TOO_LARGE code', () => {
      const exception = new HttpException(
        'Payload Too Large',
        HttpStatus.PAYLOAD_TOO_LARGE,
      );

      expect(fromHttpException(exception)).toEqual(
        toErrorResponse(
          'Request body too large',
          API_ERROR_CODES.PAYLOAD_TOO_LARGE,
        ),
      );
    });
  });

  describe('isPayloadTooLargeError', () => {
    it('detects express body-parser entity.too.large errors', () => {
      expect(
        isPayloadTooLargeError({
          type: 'entity.too.large',
          status: 413,
          message: 'request entity too large',
        }),
      ).toBe(true);
    });
  });
});
