import { CamelToSnakeCaseObject } from './cases';

/** ふぁぼ */
export type Favourite = {
  id?: number;
  favouritedPostsUserId?: string;
  favouritedPostId?: string;
  userId?: string;
};

export type FavouriteApi = CamelToSnakeCaseObject<Favourite>;
