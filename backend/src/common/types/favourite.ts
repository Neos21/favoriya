import { CamelToSnakeCaseObject } from './cases';

import type { User } from './user';

/** ふぁぼ */
export type Favourite = {
  id?: number;
  favouritedPostsUserId?: string;
  favouritedPostId?: string;
  userId?: string;
  
  user?: User;
};

export type FavouriteApi = CamelToSnakeCaseObject<Favourite>;
