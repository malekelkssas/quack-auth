import { useEffect, useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import ProgressLoader from '@/components/ProgressLoader';
import { useAuth } from '@/hooks/slices/useAuth';
import { useLazyGetMeQuery } from '@/store/api/authApi';
import { FE_ROUTES } from '@/utils/constants';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const [triggerGetMe, { isLoading, isFetching, isError, isUninitialized }] =
    useLazyGetMeQuery();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!attemptedRef.current) {
      attemptedRef.current = true;
      void triggerGetMe();
    }
  }, [triggerGetMe]);

  const isChecking = isUninitialized || isLoading || isFetching;

  if (isChecking) {
    return <ProgressLoader />;
  }

  if (isError || !isAuthenticated) {
    return <Navigate to={FE_ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
