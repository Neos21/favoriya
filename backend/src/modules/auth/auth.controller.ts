import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';

import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../shared/helpers/convert-case';
import { UserApi } from '../../shared/types/user';
import { AuthService } from './auth.service';

import type { Response } from 'express';
/** Auth Controller */
@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  
  /** ログイン認証する */
  @Post('login')
  public async login(@Body() userInfoApi: UserApi, @Res() response: Response): Promise<Response<UserApi>> {
    try {
      const { userId, password } = snakeToCamelCaseObject(userInfoApi);
      const userInfo = await this.authService.login(userId, password);
      const responseUserInfo: UserApi = camelToSnakeCaseObject(userInfo);
      return response.status(HttpStatus.OK).json(responseUserInfo);
    }
    catch(_error) {
      return response.status(HttpStatus.UNAUTHORIZED).json({ error: 'ユーザ名・パスワードが正しくありません' });
    }
  }
}
