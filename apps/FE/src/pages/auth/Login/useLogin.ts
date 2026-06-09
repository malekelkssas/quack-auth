import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Login } from '@shared/dtos';
import type { z } from 'zod';

import { useLoginMutation } from '@/hooks/slices/useAuth';
import { useError } from '@/hooks/use-error';
import { usePasswordVisibility } from '@/hooks/use-password-visibility';
import { toast } from '@/hooks/use-toast';
import {
  FE_ROUTES,
  TOAST_DEFAULT_TITLE,
  TOAST_VARIANTS,
} from '@/utils/constants';
import { toErrorResponse } from '@/utils/rtk-error.util';

export function useLogin() {
  const navigate = useNavigate();
  const { showPassword, toggleShowPassword, passwordInputType } =
    usePasswordVisibility();

  const [login, { isLoading, error, reset }] = useLoginMutation();

  const form = useForm<z.input<typeof Login>, unknown, z.output<typeof Login>>({
    resolver: zodResolver(Login),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login(values).unwrap();
      toast({
        variant: TOAST_VARIANTS.SUCCESS,
        title: TOAST_DEFAULT_TITLE,
        description: 'Welcome back to the pond!',
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
    isLoggingIn: isLoading,
  };
}
