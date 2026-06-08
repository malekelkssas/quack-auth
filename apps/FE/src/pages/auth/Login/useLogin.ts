import { type FormEvent } from 'react';

import { toast } from '@/hooks/use-toast';
import { usePasswordVisibility } from '@/hooks/use-password-visibility';
import { TOAST_DEFAULT_TITLE, TOAST_VARIANTS } from '@/utils/constants';

/** Login page logic — UI only until a BE login route exists. */
export function useLogin() {
  const { showPassword, toggleShowPassword, passwordInputType } =
    usePasswordVisibility();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      variant: TOAST_VARIANTS.WARNING,
      title: TOAST_DEFAULT_TITLE,
      description: "Login isn't open yet — sign up to enter the pond!",
    });
  };

  return { showPassword, toggleShowPassword, passwordInputType, onSubmit };
}
