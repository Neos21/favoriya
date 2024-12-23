import { configureStore } from '@reduxjs/toolkit';

import { emojisReducer } from './emojis-slice';
import { notificationsReducer } from './notifications-slice';
import { userReducer } from './user-slice';

/** Store */
export const store = configureStore({
  reducer: {
    user         : userReducer,
    notifications: notificationsReducer,
    emojis       : emojisReducer
  }
});

/** Root State */
export type RootState = ReturnType<typeof store.getState>;
