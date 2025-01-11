import { CamelToSnakeCaseObject } from './cases';

import type { Emoji } from './emoji';
import type { User } from './user';

/** 通知 */
export type Notification = {
  id?: number;
  notificationType?: string;
  message?: string;
  recipientUserId?: string;
  actorUserId?: string;
  postId?: string;
  emojiId?: number;
  isRead?: boolean;
  createdAt?: Date | string;
  
  recipientUser?: User;
  actorUser?: User;
  emoji?: Emoji;
};

export type NotificationApi = CamelToSnakeCaseObject<Notification>;
