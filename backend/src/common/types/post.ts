import { CamelToSnakeCaseObject } from './cases';
import { User } from './user';

/** 投稿 */
export type Post = {
  id?: string;
  userId: string;
  text: string;
  
  createdAt?: any;
  updatedAt?: any;
  
  user?: User;
};

export type PostApi = CamelToSnakeCaseObject<Post>;
