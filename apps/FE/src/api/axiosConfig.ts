import axios from 'axios';
import { CSRF_CONSTANTS, ENV_KEYS } from '@shared/constants';
import { readBrowserCookie, resolveCsrfCookieName } from '@/utils/csrf.util';

const baseURL = import.meta.env[ENV_KEYS.VITE_API_URL];
if (!baseURL) {
  throw new Error(`Missing ${ENV_KEYS.VITE_API_URL} in environment`);
}

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

const axiosConfig = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosConfig.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  if (!method || !MUTATING_METHODS.has(method)) {
    return config;
  }

  const csrfToken = readBrowserCookie(resolveCsrfCookieName());
  if (csrfToken) {
    config.headers.set(CSRF_CONSTANTS.HEADER_NAME, csrfToken);
  }

  return config;
});

export default axiosConfig;
