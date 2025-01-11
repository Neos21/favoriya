import DOMPurify from 'dompurify';

import { commonTopicsConstants } from '../../../../common/constants/topics-constants';
import { isValidText } from '../../../../common/helpers/validators/validator-post';

import type { Result } from '../../../../common/types/result';
import type { RandomLimit } from '../../../types/random-limit';

/** テキストの入力チェック */
export const validateText = (text: string, topicId: number, randomLimit: RandomLimit, pollOptions: Array<string>): Result<boolean> => {
  // 画像のみモードはテキストは未入力でも良い
  if(topicId === commonTopicsConstants.imageOnly.id) return { result: true };
  
  // 基本的な入力チェック
  const textContent = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  const baseValidationResult = isValidText(textContent);
  if(baseValidationResult.error != null) return baseValidationResult;
  
  // トピックごとの入力チェック
  const topic = Object.values(commonTopicsConstants).find(topic => topic.id === topicId);
  if(topic == null) return { error: '不正なトピックです' };
  
  if([commonTopicsConstants.englishOnly.id, commonTopicsConstants.kanjiOnly.id, commonTopicsConstants.senryu.id].includes(topicId)) {
    const validationResult = (topic as unknown as { validateFunction: (textContent: string) => Result<boolean> }).validateFunction(textContent);
    if(validationResult.error != null) return validationResult;
  }
  if(topicId === commonTopicsConstants.randomLimit.id) {
    const validationResult = (topic as unknown as { validateFunction: (textContent: string, mode: string, min: number, max: number) => Result<boolean> }).validateFunction(textContent, randomLimit.mode, randomLimit.min, randomLimit.max);
    if(validationResult.error != null) return validationResult;
  }
  if(topicId === commonTopicsConstants.poll.id) {
    const validationResult = (topic as unknown as { validateFunction: (texts: Array<string>) => Result<boolean> }).validateFunction(pollOptions);
    if(validationResult.error != null) return validationResult;
  }
  
  return { result: true };
};
