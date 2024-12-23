import { isEmptyString } from '../is-empty-string';

import type { Result } from '../../types/result';

/** ユーザ ID の入力チェック */
export const isValidId = (id: string): Result<boolean> => {
  if(isEmptyString(id)) return { error: 'ユーザ ID を入力してください' };
  if(!/^[a-z0-9-]+$/.test(id)) return { error: 'ユーザ ID は数字・英小文字・ハイフンのみ使用できます' };
  const maxLength = 25;
  if(id.length > maxLength) return { error: `ユーザ ID は ${maxLength} 文字以内である必要があります` };
  return { result: true };  // バリデーション成功
};

/** パスワードの入力チェック */
export const isValidPassword = (password: string): Result<boolean> => {
  if(isEmptyString(password)) return { error: 'パスワードを入力してください' };
  if(!/^[\w!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/.test(password)) return { error: 'パスワードは半角英数字と記号のみ使用できます' };
  const minLength =  8;
  const maxLength = 64;
  if(password.length < minLength || password.length > maxLength) return { error: `パスワードは ${minLength} 文字以上 ${maxLength} 文字以内である必要があります` };
  return { result: true };
};

/** ユーザ名の入力チェック */
export const isValidName = (name: string): Result<boolean> => {
  if(isEmptyString(name)) return { error: 'ユーザ名を入力してください' };
  const maxLength = 50;
  if(name.length > maxLength) return { error: `ユーザ名は ${maxLength} 文字以内である必要があります` };
  return { result: true };
};

/** プロフィールテキストの入力チェック */
export const isValidProfileText = (profileText: string): Result<boolean> => {
  const maxLength = 500;
  if(profileText.length > maxLength) return { error: `プロフィールテキストは ${maxLength} 文字以内である必要があります` };
  return { result: true };
};
