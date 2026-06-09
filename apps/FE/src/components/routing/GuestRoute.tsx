import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/hooks/slices/useAuth';
import { FE_ROUTES } from '@/utils/constants';

export function GuestRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={FE_ROUTES.HOME} replace />;
  }

  return <Outlet />;
}
