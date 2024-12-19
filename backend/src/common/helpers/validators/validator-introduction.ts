import { isEmptyString } from '../is-empty-string';

import type { Result } from '../../types/result';

/** 紹介文の入力チェック */
export const isValidIntroductionText = (introductionText: string): Result<boolean> => {
  if(isEmptyString(introductionText)) return { error: '紹介文を入力してください' };
  const maxLength = 500;
  if(introductionText.length > maxLength) return { error: `紹介文は ${maxLength} 文字以内である必要があります` };
  return { result: true };
};
