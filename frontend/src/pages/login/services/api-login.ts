/**
 * ログイン API をコールする
 * 
 * @param userName ユーザ名
 * @param password パスワード
 * @return レスポンス
 */
export const apiLogin = async (userName: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_name: userName,
      password
    })
  });
  
  if(!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? 'ログインに失敗しました');
  }
  
  return await response.json();
};
