import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../../common/helpers/convert-case';

import type { User, UserApi } from '../../../common/types/user';

/**
 * ログイン API をコールする
 * 
 * @param userId ユーザ ID
 * @param password パスワード
 * @return ユーザ情報
 * @throws ログイン失敗時
 */
export const apiLogin = async (userId: string, password: string): Promise<User> => {
  const requestUserApi: UserApi = camelToSnakeCaseObject({ userId, password });
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestUserApi)
  });
  
  if(!response.ok) {
    const error = await response.json();  // Throws
    throw new Error(error.error ?? 'ログインに失敗しました');
  }
  
  const responseUserApi: UserApi = await response.json();  // Throws
  const resultUser: User = snakeToCamelCaseObject(responseUserApi);
  return resultUser;
};
