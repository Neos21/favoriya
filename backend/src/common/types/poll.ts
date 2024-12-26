import { CamelToSnakeCaseObject } from './cases';

import type { PollOption } from './poll-option';
import type { PollVote } from './poll-vote';
import type { Post } from './post';

/** 投稿に紐付くアンケート */
export type Poll = {
  id?: number;
  userId?: string;
  postId?: string;
  expiresAt?: Date | string;
  
  post?: Post;
  pollOptions?: Array<PollOption>;
  pollVotes?: Array<PollVote>;
};

export type PollApi = CamelToSnakeCaseObject<Poll>;
