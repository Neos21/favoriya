import { CamelToSnakeCaseObject } from './cases';

import type { Follow } from './follow';
import type { Post } from './post';

/** ユーザ情報 */
export type User = {
  // UserEntity と同じカラム
  id?: string;
  passwordHash?: string;
  name?: string;
  role?: string;
  avatarUrl?: string;
  profileText?: string;
  showOwnFavouritesCount?: boolean;
  showOthersFavouritesCount?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  posts?: Array<Post>;
  followers?: Array<Follow>;
  followings?: Array<Follow>;
  recipientNotifications?: Array<Notification>;
  actorNotifications?: Array<Notification>;
  
  // 追加分
  password?: string;
  token?: string;
};

export type UserApi = CamelToSnakeCaseObject<User>;
