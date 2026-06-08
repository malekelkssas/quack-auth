import { AsyncEncryptStorage } from 'encrypt-storage';

import { getPersistSecretKey } from './persist-secret';

/**
 * redux-persist storage engine with AES encryption (encrypt-storage).
 * Replaces the abandoned redux-persist-transform-encrypt transform layer.
 */
export const encryptedStorage = new AsyncEncryptStorage(getPersistSecretKey(), {
  stateManagementUse: true,
});
