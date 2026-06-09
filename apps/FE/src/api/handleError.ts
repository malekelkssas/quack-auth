import { AXIOS_CONSTANTS, AXIOS_ERROR_CODES } from '@/utils/constants';
import { ErrorResponse } from '@shared/dtos';
import { AxiosError } from 'axios';

export function handleError(error: unknown): ErrorResponse {
  if (error instanceof AxiosError) {
    if (error.response) {
      const errorMessage: ErrorResponse = error.response?.data;
      return errorMessage;
    }
    switch (error.code) {
      case AXIOS_ERROR_CODES.ERR_NETWORK:
        return {
          message: AXIOS_CONSTANTS.NETWORK_ERROR_MESSAGE,
        } as ErrorResponse;
      case AXIOS_ERROR_CODES.ERR_TIMEOUT:
        return { message: 'Request timed out' } as ErrorResponse;
    }
    return { message: 'An unknown error occurred' } as ErrorResponse;
  }
  return { message: 'An unknown error occurred' } as ErrorResponse;
}
