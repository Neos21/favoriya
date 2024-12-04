/** snake_case → camelCase */
export type SnakeToCamelCase<T extends string> = T extends `${infer R}_${infer U}`
  ? `${R}${Capitalize<SnakeToCamelCase<U>>}`
  : T;

/** snake_case → camelCase オブジェクト */
export type SnakeToCamelCaseObject<T extends object> = {
  [K in keyof T as `${SnakeToCamelCase<string & K>}`]: T[K] extends object ? SnakeToCamelCaseObject<T[K]> : T[K]
};

/** camelCase → snake_case */
export type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

/** camelCase → snake_case オブジェクト*/
export type CamelToSnakeCaseObject<T extends object> = {
  [K in keyof T as `${CamelToSnakeCase<string & K>}`]: T[K] extends object ? CamelToSnakeCaseObject<T[K]> : T[K]
};
