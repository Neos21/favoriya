import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { Emoji } from '../../common/types/emoji';

export const initialEmojisState = {
  emojis: []
};

/** Emojis State */
export const emojisSlice = createSlice({
  name: 'emojis',
  initialState: initialEmojisState,
  reducers: {
    /** 絵文字一覧をセットする (既存データは無視して全更新) */
    setAllEmojis: (_state, action: PayloadAction<{ emojis: Array<Emoji> }>) => {
      return action.payload;
    }
  }
});

export const { setAllEmojis } = emojisSlice.actions;
export const emojisReducer = emojisSlice.reducer;
