import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { handleError } from '@/api/handleError';
import { AuthService } from '@/api/services';
import type { ErrorResponse, Signup, User } from '@shared/dtos';

export interface AuthState {
  user: User | null;
  isSigningUp: boolean;
  signupError: ErrorResponse | null;
  signupSucceeded: boolean;
}

const initialState: AuthState = {
  user: null,
  isSigningUp: false,
  signupError: null,
  signupSucceeded: false,
};

export const signup = createAsyncThunk<
  void,
  Signup,
  { rejectValue: ErrorResponse }
>('auth/signup', async (body, { rejectWithValue }) => {
  try {
    await AuthService.signup(body);
  } catch (error) {
    return rejectWithValue(handleError(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearSignupState(state) {
      state.isSigningUp = false;
      state.signupError = null;
      state.signupSucceeded = false;
    },
    clearAuthError(state) {
      state.signupError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.isSigningUp = true;
        state.signupError = null;
        state.signupSucceeded = false;
      })
      .addCase(signup.fulfilled, (state) => {
        state.isSigningUp = false;
        state.signupSucceeded = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isSigningUp = false;
        state.signupError =
          action.payload ??
          ({ message: 'Signup failed' } satisfies ErrorResponse);
      });
  },
});

export const { clearSignupState, clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;

type AuthRootState = { auth: AuthState };

export const selectAuthUser = (state: AuthRootState) => state.auth.user;
export const selectIsSigningUp = (state: AuthRootState) =>
  state.auth.isSigningUp;
export const selectSignupError = (state: AuthRootState) =>
  state.auth.signupError;
export const selectSignupSucceeded = (state: AuthRootState) =>
  state.auth.signupSucceeded;
