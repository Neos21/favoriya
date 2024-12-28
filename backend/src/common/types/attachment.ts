import { CamelToSnakeCaseObject } from './cases';

import type { Post } from './post';

/** 投稿に紐付く添付ファイル */
export type Attachment = {
  id?: number;
  userId?: string;
  postId?: string;
  filePath?: string;
  mimeType?: string;
  
  post?: Post;
};

export type AttachmentApi = CamelToSnakeCaseObject<Attachment>;
