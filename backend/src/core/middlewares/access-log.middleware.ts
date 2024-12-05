import { NextFunction, Request, Response } from 'express';

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

import { cyan, yellow } from '../utils/colour-logger';

/** アクセスログを出力するミドルウェア */
@Injectable()
export class AccessLogMiddleware implements NestMiddleware {
  private logger: Logger = new Logger(AccessLogMiddleware.name);
  
  /** ミドルウェアの処理 : アクセスログを出力する */
  public use(req: Request, _res: Response, next: NextFunction): void {
    this.logger.log(yellow(`[${req.method}]`) + ' ' + cyan(`[${req.baseUrl}]`) + this.stringifyParam('Query', req.query) + this.stringifyParam('Body', req.body));
    
    // トップページへの遷移時のみアクセス元情報を確認する
    if(['', '/'].includes(req.baseUrl)) this.logger.log(`Referer [${req.headers.referer ?? ''}] IP [${req.headers.ip ?? ''}]`);
    
    next();
  }
  
  /** パラメータオブジェクトを安全に文字列化する */
  private stringifyParam(name: string, param: any): string {
    try {
      const parsedParam = param != null ? JSON.stringify(param) : '';
      return ['', '{}'].includes(parsedParam) ? '' : ` ${name}:${parsedParam}`;
    }
    catch(_error) {
      return '';
    }
  }
}
