import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { HttpStatus, Injectable } from '@nestjs/common';

import { topicsConstants } from '../../../common/constants/topics-constants';

import type { Result } from '../../../common/types/result';

/** Post Validation Service */
@Injectable()
export class PostValidationService {
  /** トピックに基づいて入力チェックする */
  public validateText(text: string, topicId: number = topicsConstants.normal.id): Result<boolean> {
    // 全ての HTML 要素を取り除く
    const textContent = DOMPurify(new JSDOM('').window).sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    // トピックを取得する
    const topic = Object.values(topicsConstants).find(topic => topic.id === topicId);
    if(topic == null) return { error: '不正なトピック ID です', code: HttpStatus.BAD_REQUEST };
    
    // 入力チェックする
    if([topicsConstants.englishOnly.id, topicsConstants.kanjiOnly.id, topicsConstants.senryu.id].includes(topic.id)) {
      const validateResult = (topic as any)?.validateFunction(textContent);
      if(validateResult.error != null) return { error: validateResult.error, code: HttpStatus.BAD_REQUEST };
    }
    
    // 成功
    return { result: true };
  }
}
