import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import type { NextFunction } from 'express';

/** フロントエンド資材が見つからない時に固定 HTML を表示する */
@Catch()
export class NotFoundExceptionFilter implements ExceptionFilter {
  public catch(exception : any, host: ArgumentsHost): void {
    const request = host.switchToHttp();
    const response = request.getResponse();
    const next = request.getNext<NextFunction>();
    if(exception.code === 'ENOENT') {
      response.sendFile('/var/www/favoriya/502.html');  // NOTE : 決め打ちなので注意
    }
    else {
      next(exception);
    }
  }
}
