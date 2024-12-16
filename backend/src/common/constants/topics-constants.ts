import type { Result } from '../../common/types/result';

/** トピック定義 */
export const topicsConstants = {
  normal: {
    id: 1,
    name: '通常モード',
    validateFunction: (_text: string): Result<boolean> => {
      return { result: true };
    }
  },
  englishOnly: {
    id: 2,
    name: '英語のみモード',
    validateFunction: (text: string): Result<boolean> => {
      if(!(/^[a-zA-Z\s.,!?<>]+$/).test(text)) return { error: '英語のみモードでは英語以外の文字は投稿できません' };
      return { result: true };
    }
  },
  kanjiOnly: {
    id: 3,
    name: '漢字のみモード',
    validateFunction: (text: string): Result<boolean> => {
      if(!(/^[\u4E00-\u9FFF\s<>]+$/).test(text)) return { error: '漢字のみモードでは漢字以外の文字は投稿できません' };
      return { result: true };
    }
  },
  senryu: {
    id: 4,
    name: '川柳モード',
    validateFunction: (text: string): Result<boolean> => {
      const syllablePattern = [5, 7, 5];
      const lines = text.split((/[　\n]/)).map(line => line.trim());
      if(lines.length !== syllablePattern.length) return { error: '川柳モードでは五七五を改行または全角スペースで区切ってください' };
      if(!lines.every((line, i) => line.length === syllablePattern[i])) return { error: '川柳モードでは五七五の形式を守る必要があります' };
      return { result: true };
    }
  },
  anonymous: {
    id: 5,
    name: '匿名投稿モード',
    validateFunction: (_text: string): Result<boolean> => {
      return { result: true };
    }
  }
};
