import { choiceTopicId } from './choice-topic-id';

/** フォームの初期値 */
export const initialFormData = () => {
  return {
    topicId      : choiceTopicId(),
    text         : '',
    visibility   : null,
    pollOptions  : ['', ''],     // 2つは入れておく
    pollExpires  : '5 minutes',  // デフォルト値
    file         : null,
    isCreateEmoji: null,
    emojiName    : null
  };
};
