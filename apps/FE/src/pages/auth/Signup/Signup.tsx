import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PixelButton } from '@/components/duck/PixelButton';
import { PixelField } from '@/components/duck/PixelField';
import AuthLayout from '@/pages/auth/AuthLayout';
import { FE_ROUTES } from '@/utils/constants';

import { useSignup } from './useSignup';

export function Signup() {
  const {
    form,
    mode,
    setMode,
    showPassword,
    toggleShowPassword,
    onSubmit,
    isSigningUp,
  } = useSignup();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <AuthLayout
      mode={mode}
      onModeChange={setMode}
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
          {...register('name')}
        />
        <PixelField
          id="signup-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
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
