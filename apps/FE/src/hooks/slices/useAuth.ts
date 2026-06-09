import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  resetAuth,
  selectAuthUser,
  selectIsAuthenticated,
} from '@/store/slices/authSlice';

export {
  useGetMeQuery,
  useLazyGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from '@/store/api/authApi';

/**
 * Unified auth slice interface — when slice shape or RTK Query hooks change,
 * update this hook (and sibling slice hooks) instead of many page consumers.
 */
export function useAuth() {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectAuthUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const clearAuth = useCallback(() => dispatch(resetAuth()), [dispatch]);

  return {
    user,
    isAuthenticated,
    resetAuth: clearAuth,
  };
}
