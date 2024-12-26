import { CamelToSnakeCaseObject } from './cases';

import type { Poll } from './poll';
import type { PollOption } from './poll-option';

/** 選択肢に対する回答 */
export type PollVote = {
  id?: number;
  pollId?: number;
  pollOptionId?: number;
  userId?: string;
  createdAt?: Date | string;
  
  poll?: Poll;
  pollOption?: PollOption;
};

export type PollVoteApi = CamelToSnakeCaseObject<PollVote>;
