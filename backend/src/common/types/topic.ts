import { CamelToSnakeCaseObject } from './cases';

import type { Post } from './post';

/** 投稿のトピック */
export type Topic = {
  id?: number;
  name?: string;
  
  posts?: Array<Post>;
};

export type TopicApi = CamelToSnakeCaseObject<Topic>;
