import { combineReducers, type AnyAction } from '@reduxjs/toolkit';

import { authApi } from './api/authApi';
import { quackApi } from './api/quackApi';
import { RESET_APP } from './reset';
import { authReducer } from './slices/authSlice';

const combinedReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [quackApi.reducerPath]: quackApi.reducer,
});

export const appReducer = (
  state: ReturnType<typeof combinedReducer> | undefined,
  action: AnyAction,
) => {
  if (action.type === RESET_APP) {
    return combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
};

export type RootState = ReturnType<typeof combinedReducer>;
