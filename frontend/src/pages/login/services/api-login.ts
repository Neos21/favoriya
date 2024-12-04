import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../../common/helpers/convert-case';

import type { Result } from '../../../common/types/result';
import type { User, UserApi } from '../../../common/types/user';

/**
 * ログイン API をコールする
 * 
 * @param userId ユーザ ID
 * @param password パスワード
 * @return ユーザ情報
 * @throws Fetch API の失敗時、正常なはずの Response JSON がパースできなかった時
 */
export const apiLogin = async (userId: string, password: string): Promise<Result<User>> => {
  const requestUserApi: UserApi = camelToSnakeCaseObject({ userId, password });
  const response = await fetch('/api/auth/login', {  // Throws
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestUserApi)
  });
  
  const responseResult: Result<UserApi> = await response.json();  // Throws
  
  if(!response.ok) return { error: responseResult.error };
  
  const result: User = snakeToCamelCaseObject(responseResult.result);
  return { result };
};
