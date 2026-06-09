import { useEffect } from 'react';
import { BE_ROUTES } from '@shared/constants';

import api from '@/api/axiosConfig';

let bootstrapPromise: Promise<void> | null = null;

const CSRF_BOOTSTRAP_PATH = `/${BE_ROUTES.USERS}/${BE_ROUTES.ME}`;

/** Safe GET — issues the double-submit CSRF cookie (mirrors BE test `fetchCsrf`). */
export function bootstrapCsrf(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = api
      .get(CSRF_BOOTSTRAP_PATH, {
        // Unauthenticated bootstrap: 401 still sets qa_csrf_token (see security.md).
        validateStatus: (status) => status === 200 || status === 401,
      })
      .then(() => undefined)
      .catch((error: unknown) => {
        bootstrapPromise = null;
        return Promise.reject(error);
      });
  }

  return bootstrapPromise;
}

/** Load CSRF cookie once on app mount for authenticated mutations (e.g. POST /api/quack). */
export function useCsrfBootstrap(): void {
  useEffect(() => {
    void bootstrapCsrf();
  }, []);
}
