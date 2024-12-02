import { configureStore } from '@reduxjs/toolkit';

import { userReducer } from './user-slice';

/** Store */
export const store = configureStore({
  reducer: {
    user: userReducer
  }
});

/** Root State */
export type RootState = ReturnType<typeof store.getState>;
