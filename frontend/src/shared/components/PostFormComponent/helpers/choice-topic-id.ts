import { commonTopicsConstants } from '../../../../common/constants/topics-constants';
import { getRandomFromArray } from '../../../../common/helpers/get-random-from-array';
import { getRandomIntInclusive } from '../../../../common/helpers/get-random-int-inclusive';

/** ランダム選択に使用するトピック一覧 */
const topicIds = [
  commonTopicsConstants.englishOnly.id,
  commonTopicsConstants.kanjiOnly.id,
  commonTopicsConstants.senryu.id,
  commonTopicsConstants.randomDecorations.id,
  commonTopicsConstants.randomLimit.id,
  commonTopicsConstants.aiGenerated.id,
  commonTopicsConstants.imageOnly.id,
  commonTopicsConstants.movaPic.id,
  commonTopicsConstants.balus.id
];

/** トピックをランダムに選択する */
export const choiceTopicId = () => {
  const random = getRandomIntInclusive(0, 1);  // 通常モードの割合を増やす
  return random === 0 ? getRandomFromArray(topicIds) : commonTopicsConstants.normal.id;
};
