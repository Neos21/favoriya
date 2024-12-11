import { CamelToSnakeCaseObject } from './cases';

import type { Favourite } from './favourite';
import type { User } from './user';

/** 投稿 */
export type Post = {
  id?: string;
  userId: string;
  text: string;
  favouritesCount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  user?: User;
  favourites?: Array<Favourite>;
};

export type PostApi = CamelToSnakeCaseObject<Post>;
