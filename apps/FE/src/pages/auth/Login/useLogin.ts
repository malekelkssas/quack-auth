import { type FormEvent, useState } from 'react';

import type { DuckMode } from '@/components/duck/DuckCanvas';
import { toast } from '@/hooks/use-toast';
import { TOAST_VARIANTS } from '@/utils/constants';

/**
 * Login page logic — UI only (no BE login route yet). Submitting fires a
 * `warning` toast to demonstrate the variant and nudge users to sign up.
 */
export function useLogin() {
  const [mode, setMode] = useState<DuckMode>('duckling');
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword((value) => !value);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      variant: TOAST_VARIANTS.WARNING,
      title: 'QUACK!',
      description: "Login isn't open yet — sign up to enter the pond!",
    });
  };

  return { mode, setMode, showPassword, toggleShowPassword, onSubmit };
}

export default useLogin;
