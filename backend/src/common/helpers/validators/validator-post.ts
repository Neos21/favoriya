import { Result } from '../../types/result';

/** テキストの入力チェック */
export const isValidText = (text: string): Result<boolean> => {
  if(text.trim() === '') return { error: 'テキストを入力してください' };
  if(text.length > 500) return { error: 'テキストは500文字以内である必要があります' };
  return { result: true };
};
