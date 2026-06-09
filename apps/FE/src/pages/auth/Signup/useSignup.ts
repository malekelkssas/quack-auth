import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Signup } from '@shared/dtos';
import type { z } from 'zod';

import { useAuth } from '@/hooks/slices/useAuth';
import { useError } from '@/hooks/use-error';
import { usePasswordVisibility } from '@/hooks/use-password-visibility';
import { useSuccess } from '@/hooks/use-success';

export function useSignup() {
  const { showPassword, toggleShowPassword, passwordInputType } =
    usePasswordVisibility();

  const {
    signup,
    isSigningUp,
    signupError,
    signupSucceeded,
    clearSignup,
    clearError,
  } = useAuth();

  const form = useForm<
    z.input<typeof Signup>,
    unknown,
    z.output<typeof Signup>
  >({
    resolver: zodResolver(Signup),
    defaultValues: { email: '', name: '', password: '' },
  });

  const onSubmit = form.handleSubmit((values) => {
    void signup(values);
  });

  useError({ error: signupError, clearError });

  useSuccess({
    succeeded: signupSucceeded,
    message: 'Welcome to the pond!',
    onShown: () => {
      form.reset();
      clearSignup();
    },
  });

  useEffect(() => {
    return () => {
      clearSignup();
    };
  }, [clearSignup]);

  return {
    form,
    showPassword,
    toggleShowPassword,
    passwordInputType,
    onSubmit,
    isSigningUp,
  };
}
