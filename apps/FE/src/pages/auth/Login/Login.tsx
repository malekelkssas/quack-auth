import { MAX_PASSWORD_LENGTH } from '@shared/dtos';
import { Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PasswordVisibilityToggle } from '@/components/duck/PasswordVisibilityToggle';
import { PixelButton } from '@/components/duck/PixelButton';
import { PixelField } from '@/components/duck/PixelField';
import { AuthLayout } from '@/pages/auth/AuthLayout';
import { FE_ROUTES } from '@/utils/constants';

import { useLogin } from './useLogin';

export function Login() {
  const {
    form,
    showPassword,
    toggleShowPassword,
    passwordInputType,
    onSubmit,
    isLoggingIn,
  } = useLogin();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <AuthLayout
      defaultMode="duckling"
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
          error={errors.email?.message}
          {...register('email')}
        />
        <PixelField
          id="login-password"
          label="Password"
          type={passwordInputType}
          autoComplete="current-password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          maxLength={MAX_PASSWORD_LENGTH}
          error={errors.password?.message}
          trailing={
            <PasswordVisibilityToggle
              showPassword={showPassword}
              onToggle={toggleShowPassword}
            />
          }
          {...register('password')}
        />
        <PixelButton type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? 'QUACKING IN...' : '[ ENTER THE POND ]'}
        </PixelButton>
      </form>
    </AuthLayout>
  );
}

export default Login;
