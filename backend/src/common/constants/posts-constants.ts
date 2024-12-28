/** バックエンド・フロントエンド共通の投稿関連の定数 */
export const commonPostsConstants = {
  /** 最大ファイルサイズ (MB 単位のためバイト数で指定する時は ×1024 ×1024 する) */
  maxFileSizeMb: 10,
  /** 最大ファイルサイズ (KB 単位のためバイト数で指定する時は ×1024 する) */
  maxFileSizeKb: 10 * 1024,
  /** バケット名 */
  bucketName: 'attachments'
};
