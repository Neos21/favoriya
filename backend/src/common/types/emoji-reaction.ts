import { CamelToSnakeCaseObject } from './cases';

import type { Emoji } from './emoji';
import type { Post } from './post';
import type { User } from './user';

/** 投稿に対する絵文字リアクション */
export type EmojiReaction = {
  id?: number;
  reactedPostsUserId?: string;
  reactedPostId?: string;
  userId?: string;
  emojiId?: number;
  createdAt?: Date | string;
  
  reactionByUser?: User;
  post?: Post;
  emoji?: Emoji;
};

export type EmojiReactionApi = CamelToSnakeCaseObject<EmojiReaction>;
