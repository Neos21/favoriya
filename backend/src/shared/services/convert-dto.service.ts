import { Injectable } from '@nestjs/common';

/** Convert DTO Service */
@Injectable()
export class ConvertDtoService {
  /** キーがスネークケースの DTO をケースにして返す : https://gist.github.com/navaneethr/fde4696ce6e713db73efc67ee39eef08#file-convertresponse-js */
  public camelCaseToSnakeCase(data: any): any {
    Object.keys(data).forEach((key) => {
      const currentObj = data[key];
      delete data[key];
      const newKey = this.toSnakeCase(key);
      data[newKey] = currentObj;
      if(this.isObject(data[newKey])) this.camelCaseToSnakeCase(data[newKey]);  // 再帰的に処理する
    });
    return data;
  }
  
  /** オブジェクトか否か */
  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
  
  /** キャメルケースの文字列をスネークケースに変換する */
  private toSnakeCase(value: string): string {
    return value
      .replace((/([a-z])([A-Z])/g), '$1_$2') // キャメルケースを分離する (camelCase → camel_Case)
      .replace((/[\s\-]+/g), '_')  // スペースやハイフンをアンダースコアに変換する
      .toLowerCase(); // 小文字にする
  }
}
