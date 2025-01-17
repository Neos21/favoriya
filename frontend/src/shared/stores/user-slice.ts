import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { User } from '../../common/types/user';

export const initialUserState: User = {
  id   : '',
  name : '',
  role : '',
  token: '',
  showOwnFavouritesCount   : false,
  showOthersFavouritesCount: false
};

/** User State */
export const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    /** ユーザ情報をセットする (既存データは無視して全更新) */
    setUser: (_state, action: PayloadAction<User>) => {
      return action.payload;
    }
  }
});

export const { setUser } = userSlice.actions;
export const userReducer = userSlice.reducer;
