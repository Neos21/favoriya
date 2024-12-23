import { CamelToSnakeCaseObject } from './cases';

/** 絵文字リアクション定義 */
export type Emoji = {
  id?: number;
  name?: string;
  imageUrl?: string;
  createdAt?: Date | string;
};

export type EmojiApi = CamelToSnakeCaseObject<Emoji>;
