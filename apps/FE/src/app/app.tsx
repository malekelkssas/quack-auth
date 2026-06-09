import { Navigate, Route, Routes } from 'react-router-dom';

import { GuestRoute } from '@/components/routing/GuestRoute';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { SessionDeathRedirect } from '@/components/routing/SessionDeathRedirect';
import { Toaster } from '@/components/ui/toaster';
import { useCsrfBootstrap } from '@/hooks/use-csrf-bootstrap';
import Home from '@/pages/Home/Home';
import Login from '@/pages/auth/Login/Login';
import Signup from '@/pages/auth/Signup/Signup';
import Logout from '@/pages/Logout/Logout';
import { FE_DEFAULT_ROUTE, FE_ROUTES } from '@/utils/constants';

export function App() {
  useCsrfBootstrap();

  return (
    <>
      <SessionDeathRedirect />
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path={FE_ROUTES.HOME} element={<Home />} />
        </Route>
        <Route element={<GuestRoute />}>
          <Route path={FE_ROUTES.LOGIN} element={<Login />} />
          <Route path={FE_ROUTES.SIGNUP} element={<Signup />} />
        </Route>
        <Route path={FE_ROUTES.LOGOUT} element={<Logout />} />
        <Route path="*" element={<Navigate to={FE_DEFAULT_ROUTE} replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
