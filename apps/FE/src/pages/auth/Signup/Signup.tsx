import { MAX_NAME_LENGTH, MAX_PASSWORD_LENGTH } from '@shared/dtos';
import { Lock, Mail, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PasswordVisibilityToggle } from '@/components/duck/PasswordVisibilityToggle';
import { PixelButton } from '@/components/duck/PixelButton';
import { PixelField } from '@/components/duck/PixelField';
import { AuthLayout } from '@/pages/auth/AuthLayout';
import { FE_ROUTES } from '@/utils/constants';

import { useSignup } from './useSignup';

export function Signup() {
  const {
    form,
    showPassword,
    toggleShowPassword,
    passwordInputType,
    onSubmit,
    isSigningUp,
  } = useSignup();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <AuthLayout
      defaultMode="both"
      title="JOIN THE POND"
      subtitle="Hatch a new account ~"
      footer={
        <>
          Already a duck?{' '}
          <Link
            to={FE_ROUTES.LOGIN}
            className="text-duck-amber hover:underline"
          >
            Quack & login
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <PixelField
          id="signup-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="duck@pond.io"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <PixelField
          id="signup-name"
          label="Name"
          type="text"
          autoComplete="name"
          placeholder="Sir Quacksalot"
          icon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          maxLength={MAX_NAME_LENGTH}
          {...register('name')}
        />
        <PixelField
          id="signup-password"
          label="Password"
          type={passwordInputType}
          autoComplete="new-password"
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
        <PixelButton type="submit" disabled={isSigningUp}>
          {isSigningUp ? 'HATCHING...' : '[ JOIN THE POND ]'}
        </PixelButton>
      </form>
    </AuthLayout>
  );
}

export default Signup;
