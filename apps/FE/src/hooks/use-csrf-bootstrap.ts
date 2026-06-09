import { useEffect } from 'react';

import api from '@/api/axiosConfig';

let bootstrapPromise: Promise<void> | null = null;

/** Safe GET to BE — issues the double-submit CSRF cookie (mirrors API test `fetchCsrf`). */
export function bootstrapCsrf(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = api
      .get('/', { params: { name: 'csrf-bootstrap' } })
      .then(() => undefined)
      .catch((error: unknown) => {
        bootstrapPromise = null;
        return Promise.reject(error);
      });
  }

  return bootstrapPromise;
}

/** Load CSRF cookie once on app mount so the first auth POST has a token. */
export function useCsrfBootstrap(): void {
  useEffect(() => {
    void bootstrapCsrf();
  }, []);
}
