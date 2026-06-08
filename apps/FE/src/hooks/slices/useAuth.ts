import { useCallback } from 'react';
import type { Signup } from '@shared/dtos';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearAuthError,
  clearSignupState,
  selectAuthUser,
  selectIsSigningUp,
  selectSignupError,
  selectSignupSucceeded,
  signup,
} from '@/store/slices/authSlice';

/**
 * Unified auth slice interface — when slice shape or actions change, update
 * this hook (and sibling slice hooks) instead of many page/component consumers.
 */
export function useAuth() {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectAuthUser);
  const isSigningUp = useAppSelector(selectIsSigningUp);
  const signupError = useAppSelector(selectSignupError);
  const signupSucceeded = useAppSelector(selectSignupSucceeded);

  const signupUser = useCallback(
    (body: Signup) => dispatch(signup(body)),
    [dispatch],
  );

  const clearSignup = useCallback(
    () => dispatch(clearSignupState()),
    [dispatch],
  );

  const clearError = useCallback(() => dispatch(clearAuthError()), [dispatch]);

  return {
    user,
    isSigningUp,
    signupError,
    signupSucceeded,
    signup: signupUser,
    clearSignup,
    clearError,
  };
}
