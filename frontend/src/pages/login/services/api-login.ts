/**
 * ログイン API をコールする
 * 
 * @param userId ユーザ ID
 * @param password パスワード
 * @return ユーザ情報
 * @throws ログイン失敗時
 */
export const apiLogin = async (userId: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: userId,
      password
    })
  });
  
  if(!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? 'ログインに失敗しました');
  }
  
  return await response.json();
};
