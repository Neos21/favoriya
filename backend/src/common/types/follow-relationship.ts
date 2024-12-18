import { CamelToSnakeCaseObject } from './cases';

import type { Follow } from './follow';

/** Following User (ログインユーザ) と Follower User のフォロー関係 */
export type FollowRelationship = {
  relationship?: string;
  followingUserId?: string;
  followerUserId?: string;
  followingToFollower?: Follow;
  followerToFollowing?: Follow;
};

export type FollowRelationshipApi = CamelToSnakeCaseObject<FollowRelationship>;
