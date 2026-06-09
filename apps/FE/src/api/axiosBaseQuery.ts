import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig } from 'axios';

import api from '@/api/axiosConfig';
import { handleError } from '@/api/handleError';
import type { ErrorResponse } from '@shared/dtos';

export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
};

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, ErrorResponse> =>
  async ({ url, method = 'get', data, params }) => {
    try {
      const result = await api({ url, method, data, params });
      return { data: result.data };
    } catch (error) {
      return { error: handleError(error) };
    }
  };
