import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Signup } from '@shared/dtos';
import type { z } from 'zod';

import { useRegisterMutation } from '@/hooks/slices/useAuth';
import { useError } from '@/hooks/use-error';
import { usePasswordVisibility } from '@/hooks/use-password-visibility';
import { toast } from '@/hooks/use-toast';
import {
  FE_ROUTES,
  TOAST_DEFAULT_TITLE,
  TOAST_VARIANTS,
} from '@/utils/constants';
import { toErrorResponse } from '@/utils/rtk-error.util';

export function useSignup() {
  const navigate = useNavigate();
  const { showPassword, toggleShowPassword, passwordInputType } =
    usePasswordVisibility();

  const [register, { isLoading, error, reset }] = useRegisterMutation();

  const form = useForm<
    z.input<typeof Signup>,
    unknown,
    z.output<typeof Signup>
  >({
    resolver: zodResolver(Signup),
    defaultValues: { email: '', name: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await register(values).unwrap();
      toast({
        variant: TOAST_VARIANTS.SUCCESS,
        title: TOAST_DEFAULT_TITLE,
        description: 'Welcome to the pond!',
      });
      form.reset();
      navigate(FE_ROUTES.HOME);
    } catch {
      // surfaced via useError
    }
  });

  useError({ error: toErrorResponse(error), clearError: reset });

  return {
    form,
    showPassword,
    toggleShowPassword,
    passwordInputType,
    onSubmit,
    isSigningUp: isLoading,
  };
}
