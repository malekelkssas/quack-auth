import { ENV_KEYS } from '@shared/constants';

let runtimeSecretKey: string | undefined;

/**
 * Dev fallback from VITE_* — obfuscation only; the value is embedded in the client bundle.
 * Prefer {@link setRuntimePersistSecretKey} with the user's access token once auth exists.
 */
export function getDevPersistSecretKey(): string {
  const key = import.meta.env[ENV_KEYS.VITE_REDUX_PERSIST_SECRET_KEY];
  if (!key) {
    throw new Error(`Missing ${ENV_KEYS.VITE_REDUX_PERSIST_SECRET_KEY} in environment`);
  }
  return key;
}

/** Override encryption key at runtime (e.g. JWT / session token after login). */
export function setRuntimePersistSecretKey(secretKey: string | undefined): void {
  runtimeSecretKey = secretKey;
}

export function getPersistSecretKey(): string {
  return runtimeSecretKey ?? getDevPersistSecretKey();
}
