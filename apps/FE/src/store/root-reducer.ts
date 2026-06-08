import { combineReducers } from '@reduxjs/toolkit';

export const rootReducer = combineReducers({
  // feature slices registered here as the store grows
});

export type RootState = ReturnType<typeof rootReducer>;
