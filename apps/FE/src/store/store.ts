import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';

import { setupAxiosInterceptors } from '@/api/setupAxiosInterceptors';

import { authApi } from './api/authApi';
import { quackApi } from './api/quackApi';
import { persistConfig } from './persist.config';
import { appReducer } from './root-reducer';
import { RESET_APP } from './reset';

const persistedReducer = persistReducer(persistConfig, appReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          RESET_APP,
        ],
      },
    }).concat(authApi.middleware, quackApi.middleware),
});

export const persistor = persistStore(store);

setupAxiosInterceptors(store, persistor);

export type AppDispatch = typeof store.dispatch;
