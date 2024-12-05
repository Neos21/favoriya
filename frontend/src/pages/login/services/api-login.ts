import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../../common/helpers/convert-case';
import { apiPostWithoutToken } from '../../../shared/services/api/api-fetch';

import type { Result } from '../../../common/types/result';
import type { User, UserApi } from '../../../common/types/user';

/**
 * ログイン API をコールする
 * 
 * @param id ユーザ ID
 * @param password パスワード
 * @return ユーザ情報
 * @throws Fetch API の失敗時、正常なはずの Response JSON がパースできなかった時
 */
export const apiLogin = async (id: string, password: string): Promise<Result<User>> => {
  const requestUserApi: UserApi = camelToSnakeCaseObject({ id, password });
  const response = await apiPostWithoutToken('/auth/login', requestUserApi);  // Throws
  
  const responseResult: Result<UserApi> = await response.json();  // Throws
  if(!response.ok) return { error: responseResult.error };
  
  const result: User = snakeToCamelCaseObject(responseResult.result);
  return { result };
};
