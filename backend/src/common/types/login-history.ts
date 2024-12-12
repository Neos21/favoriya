import { CamelToSnakeCaseObject } from './cases';

/** ログイン履歴 */
export type LoginHistory = {
  userId: string;
  ip: string;
  ua: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type LoginHistoryApi = CamelToSnakeCaseObject<LoginHistory>;
