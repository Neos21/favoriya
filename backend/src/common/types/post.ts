import { CamelToSnakeCaseObject } from './cases';

/** 投稿 */
export type Post = {
  id?: string;
  userId: string;
  text: string;
};

export type PostApi = CamelToSnakeCaseObject<Post>;
