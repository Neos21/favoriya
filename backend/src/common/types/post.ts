import { CamelToSnakeCaseObject } from './cases';

import type { Attachment } from './attachment';
import type { EmojiReaction } from './emoji-reaction';
import type { Favourite } from './favourite';
import type { Poll } from './poll';
import type { Topic } from './topic';
import type { User } from './user';

/** 投稿 */
export type Post = {
  id?: string;
  userId?: string;
  text?: string;
  topicId?: number;
  visibility?: string;
  inReplyToPostId?: string;
  inReplyToUserId?: string;
  hasPoll?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  user?: User;
  favourites?: Array<Favourite>;
  emojiReactions?: Array<EmojiReaction>;
  topic?: Topic;
  poll?: Poll;
  attachment?: Attachment;
};

export type PostApi = CamelToSnakeCaseObject<Post>;
