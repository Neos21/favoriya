import { CamelToSnakeCaseObject } from './cases';

import type { Post } from './post';
import type { User } from './user';

/** ふぁぼ */
export type Favourite = {
  id?: number;
  favouritedPostsUserId?: string;
  favouritedPostId?: string;
  userId?: string;
  createdAt?: Date | string;
  
  favouritedByUser?: User;
  post?: Post
};

export type FavouriteApi = CamelToSnakeCaseObject<Favourite>;
