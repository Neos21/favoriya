import { CamelToSnakeCaseObject } from './cases';
import { User } from './user';

/** 投稿 */
export type Post = {
  id?: string;
  userId: string;
  text: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  user?: User;
};

export type PostApi = CamelToSnakeCaseObject<Post>;
