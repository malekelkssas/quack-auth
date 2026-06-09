import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import ProgressLoader from '@/components/ProgressLoader';
import { useAuth } from '@/hooks/slices/useAuth';
import { useLazyGetMeQuery } from '@/store/api/authApi';
import { FE_ROUTES } from '@/utils/constants';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const [triggerGetMe, { isLoading, isFetching, isError, isUninitialized }] =
    useLazyGetMeQuery();

  useEffect(() => {
    if (isAuthenticated) {
      void triggerGetMe();
    }
  }, [isAuthenticated, triggerGetMe]);

  // Must run before the loading gate: handleSessionDead() dispatches resetApp()
  // (isAuthenticated → false) and authApi.util.resetApiState() (getMe →
  // isUninitialized). Checking isChecking first used to trap the route on
  // ProgressLoader forever — fixed height-0 blank screen + blue bar only.
  if (!isAuthenticated) {
    return <Navigate to={FE_ROUTES.LOGIN} replace />;
  }

  const isChecking = isUninitialized || isLoading || isFetching;

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background">
        <ProgressLoader />
      </div>
    );
  }

  if (isError) {
    return <Navigate to={FE_ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
