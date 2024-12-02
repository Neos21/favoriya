import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { User } from '../types/user';

const initialState: User = {
  userId  : '',
  userName: '',
  role    : '',
  token   : ''
};

/** User State */
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /** ユーザ情報をセットする (既存データは無視して全更新) */
    setUser: (_state, action: PayloadAction<User>) => {
      return action.payload;
    }
  }
});

export const { setUser } = userSlice.actions;
export const userReducer = userSlice.reducer;
