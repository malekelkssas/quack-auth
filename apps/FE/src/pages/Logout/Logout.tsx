import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLogoutMutation } from '@/store/api/authApi';
import { FE_ROUTES } from '@/utils/constants';

export function Logout() {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    void logout()
      .unwrap()
      .catch(() => {
        // still redirect — session may already be cleared server-side
      })
      .finally(() => {
        navigate(FE_ROUTES.LOGIN, { replace: true });
      });
  }, [logout, navigate]);

  return null;
}

export default Logout;
