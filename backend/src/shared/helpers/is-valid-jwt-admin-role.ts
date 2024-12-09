import { HttpStatus } from '@nestjs/common';

import type { Request, Response } from 'express';

/** JWT 内の role が Admin であるか否か */
export const isValidJwtAdminRole = (request: Request, response: Response): boolean => {
  const jwtPayload = (request as unknown as { user: { role: string } }).user;
  if(jwtPayload.role !== 'Admin') {
    response.status(HttpStatus.UNAUTHORIZED).json({ error: 'このリソースにアクセスできるのは管理者権限ユーザのみです' });
    return false;
  }
  return true;
};
