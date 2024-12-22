import type { Result } from '../../common/types/result';

/** トピック定義 */
export const topicsConstants = {
  normal: {
    id: 1,
    name: '通常モード'
  },
  englishOnly: {
    id: 2,
    name: '英語のみモード',
    validateFunction: (text: string): Result<boolean> => {
      if(!(/^[\p{ASCII}\p{Script=Latin}\p{General_Category=Punctuation}\p{General_Category=Symbol}\p{Emoji_Presentation}]+$/u).test(text)) return { error: '英語のみモードでは英語以外の文字は投稿できません' };
      return { result: true };
    }
  },
  kanjiOnly: {
    id: 3,
    name: '漢字のみモード',
    validateFunction: (text: string): Result<boolean> => {
      // Script_Extensions=Han に合致する : 、。・々〆〇
      // 合致しないので追加が必要         : ！？… [全角スペース] [改行]
      if(!(/^(\p{Script_Extensions=Han}|\p{Emoji_Presentation}|！|？|…|　|\n)+$/u).test(text)) return { error: '漢字のみモードでは漢字以外の文字は投稿できません' };
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
      // 1文字多い・1文字少ないは許容する
      if(!lines.every((line, index) => [syllablePattern[index], syllablePattern[index] + 1, syllablePattern[index] - 1].includes(line.length))) return { error: '川柳モードでは五七五の形式を守る必要があります' };
      return { result: true };
    }
  },
  anonymous: {
    id: 5,
    name: '匿名投稿モード'
  },
  randomDecorations: {
    id: 6,
    name: 'ランダム装飾モード'
  },
  randomLimit: {
    id: 7,
    name: 'ランダムリミットモード',
    generateLimit: (): { mode: 'min' | 'max' | 'minmax', min?: number, max?: number } => {
      const getRandomIntInclusive = (min: number, max: number): number => {
        const minCeiled  = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);  // 上限を含み下限も含む
      };
      
      const modes = ['min', 'max', 'minmax'];
      const mode = modes[Math.floor(Math.random() * modes.length)];
      
      if(mode === 'min') {
        const min = getRandomIntInclusive(1, 250);
        return { mode, min };
      }
      else if(mode === 'max') {
        const max = getRandomIntInclusive(10, 500);
        return { mode, max };
      }
      else if(mode === 'minmax') {
        const number1 = getRandomIntInclusive( 1, 250);
        const number2 = getRandomIntInclusive(10, 500);
        const min = number1 <= number2 ? number1 : number2;
        const max = number1 <= number2 ? number2 : number1;
        return { mode, min, max };
      }
      else {
        throw new Error('Invalid Mode');
      }
    },
    validateFunction: (text: string, mode: 'min' | 'max' | 'minmax', min?: number, max?: number): Result<boolean> => {
      if(mode === 'min') {
        if(text.length < min) return { error: `今回は最低 ${min} 文字以上書いてください。あと ${min - text.length} 文字必要です。` };
        return { result: true };
      }
      else if(mode === 'max') {
        if(text.length > max) return { error: `今回は ${max} 文字以内で書いてください。あと ${text.length - max} 文字削ってください。` };
        return { result: true };
      }
      else if(mode === 'minmax') {
        if(text.length < min || text.length > max) return { error: `今回は最低 ${min} 文字以上・${max} 文字以内で書いてください。現在 ${text.length} 文字です。` };
        return { result: true };
      }
      else {
        throw new Error('Invalid Mode');
      }
    }
  }
};
