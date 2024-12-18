import { Result } from '../../types/result';

/** テキストの入力チェック */
export const isValidText = (text: string): Result<boolean> => {
  if(text.trim() === '') return { error: 'テキストを入力してください' };
  const maxLength = 500;
  if(text.length > maxLength) return { error: `テキストは ${maxLength} 文字以内である必要があります` };
  return { result: true };
};
