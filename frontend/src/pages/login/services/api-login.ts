import { User, UserApi } from '../../../shared/types/user';

/**
 * ログイン API をコールする
 * 
 * @param userId ユーザ ID
 * @param password パスワード
 * @return ユーザ情報
 * @throws ログイン失敗時
 */
export const apiLogin = async (userId: string, password: string): Promise<User> => {
  const requestUserApi: UserApi = { user_id: userId, password };
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestUserApi)
  });
  
  if(!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? 'ログインに失敗しました');
  }
  
  const responseUserApi: UserApi = await response.json();
  const resultUser: User = {  // TODO : 詰め替え関数を用意して使う
    userId  : responseUserApi.user_id,
    userName: responseUserApi.user_name,
    role    : responseUserApi.role,
    token   : responseUserApi.token
  };
  return resultUser;
};
