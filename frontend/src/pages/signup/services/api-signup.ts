import { camelToSnakeCaseObject } from '../../../shared/helpers/convert-case';
import { UserApi } from '../../../shared/types/user';

/**
 * ユーザ登録 API をコールする
 * 
 * @param userId ユーザ ID
 * @param password パスワード
 * @return ユーザ情報
 * @throws ログイン失敗時
 */
export const apiSignup = async (userId: string, password: string): Promise<any> => {
  const requestUserApi: UserApi = camelToSnakeCaseObject({ userId, password });
  const response = await fetch('/api/users', {  // TODO : API を作る
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestUserApi)
  });
  
  if(!response.ok) {
    const error = await response.json();  // Throws
    throw new Error(error.error ?? 'ユーザ登録に失敗しました');
  }
  
  const result = await response.json();  // Throws
  return result;
};
