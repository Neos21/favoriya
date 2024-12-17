import { configureStore } from '@reduxjs/toolkit';

import { notificationsReducer } from './notifications-slice';
import { userReducer } from './user-slice';

/** Store */
export const store = configureStore({
  reducer: {
    user         : userReducer,
    notifications: notificationsReducer
  }
});

/** Root State */
export type RootState = ReturnType<typeof store.getState>;
