import { HttpStatus } from '@nestjs/common';

import type { Request, Response } from 'express';

/** JWT 内の sub (ユーザ ID) とリクエストパラメータ内のユーザ ID が同一であるか否か */
export const isValidJwtUserId = (request: Request, response: Response, userId: string): boolean => {
  const jwtPayload = (request as unknown as { user: { sub: string } }).user;
  if(jwtPayload.sub !== userId) {
    response.status(HttpStatus.UNAUTHORIZED).json({ error: 'このリソースにアクセスすることは許可されていません' });
    return false;
  }
  return true;
};
