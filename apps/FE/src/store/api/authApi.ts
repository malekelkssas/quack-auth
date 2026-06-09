import { createApi } from '@reduxjs/toolkit/query/react';
import { BE_ROUTES } from '@shared/constants';
import type { AuthResponse, Login, Signup } from '@shared/dtos';

import { axiosBaseQuery } from '@/api/axiosBaseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, Signup>({
      query: (body) => ({
        url: `/${BE_ROUTES.AUTH}/${BE_ROUTES.REGISTER}`,
        method: 'post',
        data: body,
      }),
      invalidatesTags: ['Auth'],
    }),
    login: builder.mutation<AuthResponse, Login>({
      query: (body) => ({
        url: `/${BE_ROUTES.AUTH}/${BE_ROUTES.LOGIN}`,
        method: 'post',
        data: body,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: `/${BE_ROUTES.AUTH}/${BE_ROUTES.LOGOUT}`,
        method: 'post',
      }),
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query<AuthResponse, void>({
      query: () => ({
        url: `/${BE_ROUTES.USERS}/${BE_ROUTES.ME}`,
        method: 'get',
      }),
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi;
