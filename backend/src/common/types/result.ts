/** 結果とエラーを表現する型 */
export type Result<T> = { result: T, error?: undefined, code?: undefined } | { result?: undefined, error: string, code?: number };
