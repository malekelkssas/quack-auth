import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { Persistor } from 'redux-persist';
import type { Store } from '@reduxjs/toolkit';
import { BE_ROUTES } from '@shared/constants';

import api from '@/api/axiosConfig';
import { authApi } from '@/store/api/authApi';
import { resetApp } from '@/store/reset';

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type FailedRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: RetryableConfig;
};

/** Dispatched from handleSessionDead so react-router can soft-navigate to login. */
export const SESSION_DEAD_EVENT = 'quack:session-dead';

const AUTH_SKIP_401_PATHS = [
  `/${BE_ROUTES.AUTH}/${BE_ROUTES.LOGIN}`,
  `/${BE_ROUTES.AUTH}/${BE_ROUTES.REFRESH}`,
  `/${BE_ROUTES.AUTH}/${BE_ROUTES.REGISTER}`,
];

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const isAuthSkipUrl = (url?: string) => {
  if (!url) return false;
  return AUTH_SKIP_401_PATHS.some((path) => url.includes(path));
};

const processQueue = (error: unknown | null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      resolve(api(config));
    }
  });
  failedQueue = [];
};

const handleSessionDead = async (store: Store, persistor: Persistor) => {
  store.dispatch(resetApp());
  store.dispatch(authApi.util.resetApiState());
  await persistor.purge();
  window.dispatchEvent(new CustomEvent(SESSION_DEAD_EVENT));
};

export function setupAxiosInterceptors(store: Store, persistor: Persistor) {
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableConfig | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        isAuthSkipUrl(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post(`/${BE_ROUTES.AUTH}/${BE_ROUTES.REFRESH}`);
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        await handleSessionDead(store, persistor);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
}
