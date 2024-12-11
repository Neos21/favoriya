import { CamelToSnakeCaseObject } from './cases';

/** ユーザ情報 */
export type User = {
  // UserEntity と同じカラム
  id: string;
  passwordHash?: string;
  name?: string;
  role?: string;
  avatarUrl?: string;
  showOwnFavouritesCount?: boolean;
  showOthersFavouritesCount?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // 追加分
  password?: string;
  token?: string;
};

export type UserApi = CamelToSnakeCaseObject<User>;
