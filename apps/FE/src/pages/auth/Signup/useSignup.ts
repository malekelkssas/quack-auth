import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Signup } from '@shared/dtos';
import type { z } from 'zod';

import type { DuckMode } from '@/components/duck/DuckCanvas';
import { useAuth } from '@/hooks/slices/useAuth';
import { useError } from '@/hooks/use-error';
import { useSuccess } from '@/hooks/use-success';

/**
 * Signup page logic — RHF + zodResolver(Signup) wired to the useAuth slice hook.
 *
 * The shared `Signup` DTO trims/lowercases email via preprocess, so input and
 * output types differ — hence the explicit `useForm<input, unknown, output>`.
 */
export function useSignup() {
  const [mode, setMode] = useState<DuckMode>('both');
  const [showPassword, setShowPassword] = useState(false);

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

  const toggleShowPassword = () => setShowPassword((value) => !value);

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

  // Clear signup slice state when leaving the page.
  useEffect(() => {
    return () => {
      clearSignup();
    };
  }, [clearSignup]);

  return {
    form,
    mode,
    setMode,
    showPassword,
    toggleShowPassword,
    onSubmit,
    isSigningUp,
  };
}

export default useSignup;
