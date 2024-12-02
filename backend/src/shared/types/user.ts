import { CamelToSnakeCaseObject } from './cases';

/** ユーザ情報 */
export type User = {
  userId: string;
  password?: string;
  passwordHash?: string;
  userName?: string;
  role?: string;
  token?: string;
};

export type UserApi = CamelToSnakeCaseObject<User>;
