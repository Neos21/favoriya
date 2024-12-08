import { CamelToSnakeCaseObject } from './cases';

/** ユーザ情報 */
export type User = {
  id: string;
  password?: string;
  passwordHash?: string;
  name?: string;
  role?: string;
  token?: string;
  
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type UserApi = CamelToSnakeCaseObject<User>;
