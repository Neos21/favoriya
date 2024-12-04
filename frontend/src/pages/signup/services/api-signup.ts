import { camelToSnakeCaseObject } from '../../../common/helpers/convert-case';

import type { Result } from '../../../common/types/result';
import type { UserApi } from '../../../common/types/user';

/**
 * ユーザ登録 API をコールする
 * 
 * @param userId ユーザ ID
 * @param password パスワード
 * @return 成功すれば `true`
 * @throws Fetch API の失敗時、正常なはずの Response JSON がパースできなかった時
 */
export const apiSignup = async (userId: string, password: string): Promise<Result<boolean>> => {
  const requestUserApi: UserApi = camelToSnakeCaseObject({ userId, password });
  const response = await fetch('/api/users', {  // Throws
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestUserApi)
  });
  
  if(!response.ok) {
    const json = await response.json();  // Throws
    return { error: json.error };
  }
  
  return { result: true };
};
