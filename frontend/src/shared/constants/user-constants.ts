/** ユーザ関連の定数 */
export const userConstants = {
  /** LocalStorage のキー */
  localStorageKey: 'user',
  /** アバター画像の URL (`https://example.com` 部分・アバター画像パスは `/` 始まりで格納されている) */
  ossUrl: process.env.VITE_OSS_URL ?? 'https://INVALID-ENV.com'
};
