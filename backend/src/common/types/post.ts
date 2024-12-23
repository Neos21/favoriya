import { CamelToSnakeCaseObject } from './cases';

import type { EmojiReaction } from './emoji-reaction';
import type { Favourite } from './favourite';
import type { Topic } from './topic';
import type { User } from './user';

/** 投稿 */
export type Post = {
  id?: string;
  userId?: string;
  text?: string;
  topicId?: number;
  visibility?: string;
  favouritesCount?: number;
  inReplyToPostId?: string;
  inReplyToUserId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  user?: User;
  favourites?: Array<Favourite>;
  emojiReactions?: Array<EmojiReaction>;
  topic?: Topic;
};

export type PostApi = CamelToSnakeCaseObject<Post>;
