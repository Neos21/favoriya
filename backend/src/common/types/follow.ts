import { CamelToSnakeCaseObject } from './cases';

import type { User } from './user';

/** フォロー関係 */
export type Follow = {
  id?: number;
  followerUserId?: string;
  followingUserId?: string;
  createdAt?: Date | string;
  
  follower?: User;
  following?: User;
};

export type FollowApi = CamelToSnakeCaseObject<Follow>;
