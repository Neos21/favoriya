import { CamelToSnakeCaseObject } from './cases';

import type { Poll } from './poll';
import type { PollVote } from './poll-vote';

/** アンケートの選択肢 */
export type PollOption = {
  id?: number;
  pollId?: number;
  text?: string;
  
  poll?: Poll;
  pollVotes?: Array<PollVote>;
};

export type PollOptionApi = CamelToSnakeCaseObject<PollOption>;
