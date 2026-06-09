import { createSlice } from '@reduxjs/toolkit';
import type { AuthUser } from '@shared/dtos';

import { authApi } from '../api/authApi';

export interface AuthState {
  user: AuthUser | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.user;
        },
      )
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.user;
        },
      )
      .addMatcher(
        authApi.endpoints.getMe.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.user;
        },
      )
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { resetAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;

type AuthRootState = { auth: AuthState };

export const selectAuthUser = (state: AuthRootState) => state.auth.user;
export const selectIsAuthenticated = (state: AuthRootState) =>
  state.auth.user !== null;
