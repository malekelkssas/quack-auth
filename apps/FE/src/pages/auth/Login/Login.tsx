import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PixelButton } from '@/components/duck/PixelButton';
import { PixelField } from '@/components/duck/PixelField';
import AuthLayout from '@/pages/auth/AuthLayout';
import { FE_ROUTES } from '@/utils/constants';

import { useLogin } from './useLogin';

export function Login() {
  const { mode, setMode, showPassword, toggleShowPassword, onSubmit } =
    useLogin();

  return (
    <AuthLayout
      mode={mode}
      onModeChange={setMode}
      title="QUACK & LOGIN"
      subtitle="Welcome back to the pond ~"
      footer={
        <>
          New to the pond?{' '}
          <Link
            to={FE_ROUTES.SIGNUP}
            className="text-duck-amber hover:underline"
          >
            Join the pond
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <PixelField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="duck@pond.io"
          icon={<Mail className="h-4 w-4" />}
        />
        <PixelField
          id="login-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          trailing={
            <button
              type="button"
              onClick={toggleShowPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="p-1 text-muted-foreground hover:text-duck-amber"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />
        <PixelButton type="submit">[ ENTER THE POND ]</PixelButton>
      </form>
    </AuthLayout>
  );
}

export default Login;
