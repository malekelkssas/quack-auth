import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { SESSION_DEAD_EVENT } from '@/api/setupAxiosInterceptors';
import { FE_ROUTES } from '@/utils/constants';

/**
 * Soft-redirect to login when the axios interceptor declares the session dead.
 * Belt-and-suspenders alongside ProtectedRoute's !isAuthenticated gate — covers
 * edge cases where the route guard does not re-render in time.
 */
export function SessionDeathRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const onSessionDead = () => {
      navigate(FE_ROUTES.LOGIN, { replace: true });
    };

    window.addEventListener(SESSION_DEAD_EVENT, onSessionDead);
    return () => window.removeEventListener(SESSION_DEAD_EVENT, onSessionDead);
  }, [navigate]);

  return null;
}
