import type { PersistConfig } from 'redux-persist';

import { encryptedStorage } from './encrypted-storage';
import type { RootState } from './root-reducer';

export const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  version: 1,
  storage: encryptedStorage,
  // blacklist auth / RTK Query caches when those slices land
};
