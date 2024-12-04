import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';

import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { AuthService } from './auth.service';

import type { UserApi } from '../../common/types/user';
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
      const user = await this.authService.login(userId, password);
      const responseUserApi: UserApi = camelToSnakeCaseObject(user);
      return response.status(HttpStatus.OK).json(responseUserApi);
    }
    catch(_error) {
      return response.status(HttpStatus.UNAUTHORIZED).json({ error: 'ユーザ名・パスワードが正しくありません' });
    }
  }
}
