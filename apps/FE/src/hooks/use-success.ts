import { useEffect, useEffectEvent } from 'react';

import { toast } from '@/hooks/use-toast';
import { TOAST_VARIANTS } from '@/utils/constants';

interface UseSuccessOptions {
  /** When true, fire the success toast once, then run `onShown` (e.g. cleanup). */
  succeeded: boolean;
  message: string;
  /** Runs right after the toast fires — typically clears the slice flag. */
  onShown: () => void;
  title?: string;
}

/**
 * Surfaces a one-shot success as a `success` toast, then runs `onShown`.
 * Mirrors `useError`; uses stable `useEffectEvent` (React 19.2).
 */
export function useSuccess({
  succeeded,
  message,
  onShown,
  title = 'QUACK!',
}: UseSuccessOptions) {
  const onSuccess = useEffectEvent(() => {
    toast({ variant: TOAST_VARIANTS.SUCCESS, title, description: message });
    onShown();
  });

  useEffect(() => {
    if (succeeded) onSuccess();
  }, [succeeded]);
}

export default useSuccess;
