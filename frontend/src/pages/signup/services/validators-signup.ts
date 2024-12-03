/** ユーザ ID の入力チェック */
export const validateUserId = (userId: string): string | null => {
  if(userId.trim() === '') return 'ユーザ ID を入力してください';
  if(!/^[a-z0-9-]+$/.test(userId)) return 'ユーザ ID は数字・英小文字・ハイフンのみ使用できます';
  if(userId.length > 25) return 'ユーザ ID は25文字以内である必要があります';
  return null; // バリデーション成功
};

/** パスワードの入力チェック */
export const validatePassword = (password: string): string | null => {
  if(password.trim() === '') return 'パスワードを入力してください';
  if(!/^[\w!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/.test(password)) return 'パスワードは半角英数字と記号のみ使用できます';
  if(password.length < 8 || password.length > 16) return 'パスワードは8文字以上16文字以内である必要があります';
  return null; // バリデーション成功
};
