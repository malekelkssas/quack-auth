import { createTransform } from 'redux-persist';
import type { PersistConfig } from 'redux-persist';

import { authApi } from './api/authApi';
import { quackApi } from './api/quackApi';
import { encryptedStorage } from './encrypted-storage';
import type { RootState } from './root-reducer';
import type { AuthState } from './slices/authSlice';

const authUserTransform = createTransform<AuthState, Pick<AuthState, 'user'>>(
  (inboundState) => ({ user: inboundState.user }),
  (outboundState) => ({ user: outboundState.user }),
  { whitelist: ['auth'] },
);

export const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  version: 1,
  storage: encryptedStorage,
  blacklist: [authApi.reducerPath, quackApi.reducerPath],
  transforms: [authUserTransform],
};
