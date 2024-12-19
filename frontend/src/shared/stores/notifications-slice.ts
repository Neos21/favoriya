import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const initialNotificationsState = {
  /** 未読の通知件数 */
  unreadNotifications: 0
};

/** Notifications State */
export const notificationsSlice = createSlice({
  name: 'user',
  initialState: initialNotificationsState,
  reducers: {
    /** 未読件数をセットする (既存データは無視して全更新) */
    setUnreadNotifications: (_state, action: PayloadAction<{ unreadNotifications: number }>) => {
      return action.payload;
    }
  }
});

export const { setUnreadNotifications } = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
