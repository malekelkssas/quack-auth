import { useCallback, useState } from 'react';

export function usePasswordVisibility(initial = false) {
  const [showPassword, setShowPassword] = useState(initial);
  const toggleShowPassword = useCallback(
    () => setShowPassword((value) => !value),
    [],
  );
  const passwordInputType = showPassword ? 'text' : 'password';

  return { showPassword, toggleShowPassword, passwordInputType };
}
