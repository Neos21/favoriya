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
 */
export const apiSignup = async (id: string, password: string): Promise<Result<boolean>> => {
  try {
    const requestUserApi: UserApi = camelToSnakeCaseObject({ id, password });
    const response = await apiPostWithoutToken('/users', requestUserApi);  // Throws
    
    if(!response.ok) {
      const json = await response.json();  // Throws
      return { error: json.error };
    }
    
    return { result: true };
  }
  catch(error) {
    console.error('apiSignup : Failed To Fetch', error);
    return { error: 'apiSignup : Failed To Fetch' };
  }
};
