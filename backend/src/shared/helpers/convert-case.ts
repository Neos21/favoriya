import { CamelToSnakeCaseObject, SnakeToCamelCaseObject } from '../types/cases';
import { isObject } from './is-object';

/** snake_case → camelCase */
export const snakeToCamelCase = (value: string): string => {
  return value.replace((/_([a-z])/g), (_, character) => character.toUpperCase());
};

/** snake_case → camelCase オブジェクト */
export const snakeToCamelCaseObject = <T extends object>(object: T): SnakeToCamelCaseObject<T> => {
  if(isObject(object)) {
    return Object.entries(object).reduce((accumulator, [snakeKey, value]) => {
      accumulator[snakeToCamelCase(snakeKey)] = value;  // FIXME : `value` がオブジェクトだった時に変換できていない
      return accumulator;
    }, {}) as SnakeToCamelCaseObject<T>;
  }
  else if(Array.isArray(object)) {
    return object.map(item => snakeToCamelCaseObject(item)) as SnakeToCamelCaseObject<T>;
  }
  return object as SnakeToCamelCaseObject<T>;
};

/** camelCase → snake_case */
export const camelToSnakeCase = (value: string): string => {
  return value.replace((/[A-Z]/g), character => `_${character.toLowerCase()}`);
};

/** camelCase → snake_case オブジェクト */
export const camelToSnakeCaseObject = <T extends object>(object: T): CamelToSnakeCaseObject<T> => {
  if(isObject(object)) {
    return Object.entries(object).reduce((accumulator, [camelKey, value]) => {
      accumulator[camelToSnakeCase(camelKey)] = value;  // FIXME : `value` がオブジェクトだった時に変換できていない
      return accumulator;
    }, {}) as CamelToSnakeCaseObject<T>;
  }
  else if(Array.isArray(object)) {
    return object.map(item => camelToSnakeCaseObject(item)) as CamelToSnakeCaseObject<T>;
  }
  return object as CamelToSnakeCaseObject<T>;
};
