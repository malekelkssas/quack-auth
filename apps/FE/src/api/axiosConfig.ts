import axios from 'axios';
import { ENV_KEYS } from '@shared/constants';

const baseURL = import.meta.env[ENV_KEYS.VITE_API_URL];
if (!baseURL) {
  throw new Error(`Missing ${ENV_KEYS.VITE_API_URL} in environment`);
}

const axiosConfig = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default axiosConfig;
