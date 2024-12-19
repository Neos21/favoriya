import type { Result } from '../../common/types/result';

/** トピック定義 */
export const topicsConstants = {
  normal: {
    id: 1,
    name: '通常モード',
    validateFunction: (_text: string): Result<boolean> => {  // eslint-disable-line @typescript-eslint/no-unused-vars
      return { result: true };
    }
  },
  englishOnly: {
    id: 2,
    name: '英語のみモード',
    validateFunction: (text: string): Result<boolean> => {
      if(!(/^[a-zA-Z0-9\s.,!?<>]+$/).test(text)) return { error: '英語のみモードでは英語以外の文字は投稿できません' };
      return { result: true };
    }
  },
  kanjiOnly: {
    id: 3,
    name: '漢字のみモード',
    validateFunction: (text: string): Result<boolean> => {
      // Script_Extensions=Han に合致する : 、。・々〆〇
      // 合致しないので追加が必要         : ！？… [全角スペース] [改行]
      if(!(/^(\p{Script_Extensions=Han}|！|？|…|　|\n)+$/u).test(text)) return { error: '漢字のみモードでは漢字以外の文字は投稿できません' };
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
    validateFunction: (_text: string): Result<boolean> => {  // eslint-disable-line @typescript-eslint/no-unused-vars
      return { result: true };
    }
  },
  randomDecorations: {
    id: 6,
    name: 'ランダム装飾モード',
    validateFunction: (_text: string): Result<boolean> => {  // eslint-disable-line @typescript-eslint/no-unused-vars
      return { result: true };
    }
  }
};
