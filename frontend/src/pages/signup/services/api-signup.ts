import { camelToSnakeCaseObject } from '../../../common/helpers/convert-case';
import { apiPostWithoutToken } from '../../../shared/services/api/api-fetch';

import type { Result } from '../../../common/types/result';
import type { UserApi } from '../../../common/types/user';

/**
 * ユーザ登録 API をコールする
 * 
 * @param id ユーザ ID
 * @param password パスワード
 * @return 成功すれば `true`
 * @throws Fetch API の失敗時、正常なはずの Response JSON がパースできなかった時
 */
export const apiSignup = async (id: string, password: string): Promise<Result<boolean>> => {
  const requestUserApi: UserApi = camelToSnakeCaseObject({ id, password });
  const response = await apiPostWithoutToken('/users', requestUserApi);  // Throws
  
  if(!response.ok) {
    const json = await response.json();  // Throws
    return { error: json.error };
  }
  
  return { result: true };
};
