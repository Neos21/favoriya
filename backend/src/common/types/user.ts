import { CamelToSnakeCaseObject } from './cases';

/** ユーザ情報 */
export type User = {
  id: string;
  password?: string;
  passwordHash?: string;
  name?: string;
  role?: string;
  token?: string;
  
  createdAt?: any;
  updatedAt?: any;
};

export type UserApi = CamelToSnakeCaseObject<User>;
