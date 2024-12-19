/**
 * 環境変数より文字列値を取得する・環境変数が存在しなければデフォルト値を使用する
 * 
 * @param envName 環境変数名
 * @param defaultValue デフォルト値
 * @return 値
 */
const getStringValue = (envName: string, defaultValue: string): string => {
  if(process.env[envName] == null || process.env[envName]!.trim() === '') {
    console.log(`configuration#getStringValue()  : Env [${envName}] is empty. Use default value [${defaultValue}]`);
    return defaultValue;
  }
  const stringValue = process.env[envName]!;
  console.log(`configuration#getStringValue()  : Env [${envName}] = [${stringValue}]`);
  return stringValue;
};

/**
 * 環境変数より値を取得し数値型で返す・環境変数が存在しないか数値型に変換できない場合はデフォルト値を使用する
 * 
 * @param envName 環境変数名
 * @param defaultValue デフォルト値
 * @return 値
 */
const getNumberValue = (envName: string, defaultValue: number): number => {
  if(process.env[envName] == null || process.env[envName]!.trim() === '') {
    console.log(`configuration#getNumberValue()  : Env [${envName}] is empty. Use default value [${defaultValue}]`);
    return defaultValue;
  }
  const rawValue = process.env[envName]!;
  const numberValue = Number(rawValue);
  if(Number.isNaN(numberValue)) {
    console.log(`configuration#getNumberValue()  : Env [${envName}] value is NaN [${rawValue}]. Use default value [${defaultValue}]`);
    return defaultValue;
  }
  console.log(`configuration#getNumberValue()  : Env [${envName}] = [${numberValue}]`);
  return numberValue;
};

/**
 * 環境変数より値が設定されているか否かで Boolean 値を返す
 * 
 * @param envName 環境変数名
 * @return 当該環境変数に何らかの値が設定されていれば `true`・未定義であれば `false`
 */
const getBooleanValue = (envName: string): boolean => {
  const isTruthy = process.env[envName] != null;
  console.log(`configuration#getBooleanValue() : Env [${envName}] = [${isTruthy}]`);
  return isTruthy;
};

/** 環境変数のオブジェクトを返す : この関数内にオブジェクトを定義しないと環境変数が読み込まれない */
export const configuration = (): { [key: string]: string | number | boolean } => ({
  noColour : getBooleanValue('NO_COLOR'                          ),  // ロガーの色付けをしない : NestJS のロガー `cli-colors.util.js` と同じ環境変数名・確認のため宣言
  port     : getNumberValue ('FAVORIYA_PORT'      , 6216         ),  // ポート番号
  jwtSecret: getStringValue ('FAVORIYA_JWT_SECRET', 'CHANGE-THIS'),  // JWT 認証のシークレット
  
  dbHost   : getStringValue ('FAVORIYA_DB_HOST'   , 'localhost'  ),  // DB ホスト
  dbPort   : getNumberValue ('FAVORIYA_DB_PORT'   , 5432         ),  // DB ポート
  dbUser   : getStringValue ('FAVORIYA_DB_USER'   , 'CHANGE-THIS'),  // DB ユーザ名
  dbPass   : getStringValue ('FAVORIYA_DB_PASS'   , 'CHANGE-THIS'),  // DB パスワード
  dbName   : getStringValue ('FAVORIYA_DB_NAME'   , 'CHANGE-THIS'),  // DB データベース名
  
  ossHost  : getStringValue ('FAVORIYA_OSS_HOST'  , 'localhost'  ),  // OSS ホスト
  ossPort  : getNumberValue ('FAVORIYA_OSS_PORT'  , 9000         ),  // OSS ポート
  ossUser  : getStringValue ('FAVORIYA_OSS_USER'  , 'CHANGE-THIS'),  // OSS ユーザ名
  ossPass  : getStringValue ('FAVORIYA_OSS_PASS'  , 'CHANGE-THIS'),  // OSS パスワード
  ossSsl   : getBooleanValue('FAVORIYA_OSS_SSL'                  )   // OSS SSL 接続するか否か
});
