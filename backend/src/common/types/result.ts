/** 結果とエラーを表現する型 */
export type Result<T> = { result: T, error?: undefined } | { result?: undefined, error: string };
