/** バックエンド・フロントエンド共通の投稿関連の定数 */
export const commonPostsConstants = {
  /** アンケートの選択肢・最低数 */
  minPollOptions: 2,
  /** アンケートの選択肢・最大数 */
  maxPollOptions: 6,
  
  /** 最大ファイルサイズ (MB 単位のためバイト数で指定する時は ×1024 ×1024 する) */
  maxFileSizeMb: 10,
  /** 最大ファイルサイズ (KB 単位のためバイト数で指定する時は ×1024 する) */
  maxFileSizeKb: 10 * 1024,
  /** 最大の幅 or 高さ (px 単位) */
  maxImagePx: 960,
  /** イラストを絵文字にする際の最大の幅・高さ (px 単位) */
  maxDrawingToEmojiPx: 128,
  /** バケット名 */
  bucketName: 'attachments'
};
