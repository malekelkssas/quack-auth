import { Navigate, Route, Routes } from 'react-router-dom';

import { Toaster } from '@/components/ui/toaster';
import Login from '@/pages/auth/Login/Login';
import Signup from '@/pages/auth/Signup/Signup';
import { FE_DEFAULT_ROUTE, FE_ROUTES } from '@/utils/constants';

export function App() {
  return (
    <>
      <Routes>
        <Route path={FE_ROUTES.LOGIN} element={<Login />} />
        <Route path={FE_ROUTES.SIGNUP} element={<Signup />} />
        <Route
          path={FE_ROUTES.HOME}
          element={<Navigate to={FE_DEFAULT_ROUTE} replace />}
        />
        <Route path="*" element={<Navigate to={FE_DEFAULT_ROUTE} replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
