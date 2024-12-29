/** 投稿関連の定数 */
export const postConstants = {
  /** 添付ファイルの URL (`https://example.com` 部分・ファイルパスは `/` 始まりで格納されている) */
  ossUrl: process.env.VITE_OSS_URL ?? 'https://INVALID-ENV.com'
};
