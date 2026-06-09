import { useEffect, useEffectEvent } from 'react';
import type { ErrorResponse } from '@shared/dtos';

import { toast } from '@/hooks/use-toast';
import {
  AXIOS_CONSTANTS,
  TOAST_DEFAULT_TITLE,
  TOAST_VARIANTS,
} from '@/utils/constants';

interface UseErrorOptions {
  /** Current error from a slice/thunk, or null when there is none. */
  error: ErrorResponse | null;
  /** Clears the error in the owning slice once it has been surfaced. */
  clearError: () => void;
  /** Optional pixel-themed title override. */
  title?: string;
}

/**
 * Surfaces a slice/thunk error as an `error` toast, then clears it.
 *
 * Skips the generic axios network message (it's noisy and not actionable).
 * Uses React 19.2 stable `useEffectEvent` so the latest `clearError`/`toast`
 * are read without re-running the effect when those identities change.
 */
export function useError({
  error,
  clearError,
  title = TOAST_DEFAULT_TITLE,
}: UseErrorOptions) {
  const onError = useEffectEvent((message: string) => {
    if (message === AXIOS_CONSTANTS.NETWORK_ERROR_MESSAGE) {
      clearError();
      return;
    }
    toast({ variant: TOAST_VARIANTS.ERROR, title, description: message });
    clearError();
  });

  useEffect(() => {
    if (error?.message) onError(error.message);
  }, [error]);
}

export default useError;
