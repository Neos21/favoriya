import { CamelToSnakeCaseObject } from './cases';

import type { User } from './user';

/** 通知 */
export type Notification = {
  id?: number;
  notificationType?: string;
  message?: string;
  recipientUserId?: string;
  actorUserId?: string;
  postId?: string;
  isRead?: boolean;
  createdAt?: Date | string;
  
  recipientUser?: User;
  actorUser?: User;
};

export type NotificationApi = CamelToSnakeCaseObject<Notification>;
