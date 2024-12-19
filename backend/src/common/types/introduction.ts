import { CamelToSnakeCaseObject } from './cases';

import type { User } from './user';

/** 相互フォロワーの紹介 */
export type Introduction = {
  id?: number;
  recipientUserId?: string;
  actorUserId?: string;
  text?: string;
  isApproved?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  recipientUser?: User;
  actorUser?: User;
};

export type IntroductionApi = CamelToSnakeCaseObject<Introduction>;
