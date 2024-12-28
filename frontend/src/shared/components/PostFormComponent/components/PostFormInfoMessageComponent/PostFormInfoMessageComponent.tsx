import { FC } from 'react';

import { Alert } from '@mui/material';

import { topicsConstants } from '../../../../../common/constants/topics-constants';

import type { RandomLimit } from '../../../../types/random-limit';

type Props = {
  selectedTopicId: number,
  randomLimit: RandomLimit
};

/** Post Form Info Message Component */
export const PostFormInfoMessageComponent: FC<Props> = ({ selectedTopicId, randomLimit }) => {
  return <>
    {selectedTopicId === topicsConstants.englishOnly.id       && <Alert severity="info" sx={{ mt: 3 }}>「英語のみ」モード is English only.</Alert>}
    {selectedTopicId === topicsConstants.kanjiOnly.id         && <Alert severity="info" sx={{ mt: 3 }}>「漢字のみ」モード…之・漢字限定、投稿可能。</Alert>}
    {selectedTopicId === topicsConstants.senryu.id            && <Alert severity="info" sx={{ mt: 3 }}>「川柳」モードでは改行または全角スペースで文章を区切り、五・七・五の形式にすると投稿できます。</Alert>}
    {selectedTopicId === topicsConstants.anonymous.id         && <Alert severity="info" sx={{ mt: 3 }}>「匿名投稿」モードでは「匿名さん」による代理投稿ができます。その代わり投稿の削除ができませんのでご注意ください。</Alert>}
    {selectedTopicId === topicsConstants.randomDecorations.id && <Alert severity="info" sx={{ mt: 3 }}>「ランダム装飾」モードでは行ごとに文字装飾を勝手に挿入したり、挿入しなかったりします。結果は投稿してのお楽しみ！</Alert>}
    {selectedTopicId === topicsConstants.randomLimit.id       && <Alert severity="info" sx={{ mt: 3 }}>
      「ランダムリミット」モードではランダムに最低・最大文字数が決定されます。
        {randomLimit.mode === 'min'    && `今回は最低 ${randomLimit.min} 文字`}
        {randomLimit.mode === 'max'    && `今回は ${randomLimit.max} 文字以内`}
        {randomLimit.mode === 'minmax' && `今回は最低 ${randomLimit.min} 文字・${randomLimit.max} 文字以内`}
      で入力してください。
    </Alert>}
    {selectedTopicId === topicsConstants.aiGenerated.id       && <Alert severity="info" sx={{ mt: 3 }}>「勝手に AI 生成モード」では投稿内容の一部が AI によって勝手に書き換えられます。結果は投稿してのお楽しみ！</Alert>}
  </>;
};
