import { createApi } from '@reduxjs/toolkit/query/react';
import { BE_ROUTES } from '@shared/constants';
import type { QuackInput, QuackResponse } from '@shared/dtos';

import { axiosBaseQuery } from '@/api/axiosBaseQuery';

export const quackApi = createApi({
  reducerPath: 'quackApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    quack: builder.query<QuackResponse, QuackInput | void>({
      query: (body) => ({
        url: `/${BE_ROUTES.QUACK}`,
        method: 'post',
        data: body ?? {},
      }),
    }),
  }),
});

export const { useQuackQuery, useLazyQuackQuery } = quackApi;
