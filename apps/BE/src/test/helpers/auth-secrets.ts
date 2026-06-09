import { ENV_KEYS } from '@shared/constants';

export const TEST_AUTH_ACCESS_SECRET =
  process.env[ENV_KEYS.AUTH_ACCESS_TOKEN_SECRET] ?? 'dev-access-secret';

export const TEST_AUTH_REFRESH_SECRET =
  process.env[ENV_KEYS.AUTH_REFRESH_TOKEN_SECRET] ?? 'dev-refresh-secret';
