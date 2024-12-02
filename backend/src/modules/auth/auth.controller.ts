import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';

import { ConvertDtoService } from '../../shared/services/convert-dto.service';
import { AuthService } from './auth.service';

import type { Response } from 'express';

/** Auth Controller */
@Controller('/api/auth')
export class AuthController {
  constructor(
    private readonly convertDtoService: ConvertDtoService,
    private readonly authService: AuthService,
  ) { }
  
  /** ログイン認証する */
  @Post('login')
  public async login(@Body('user_id') userId: string, @Body('password') password: string, @Res() response: Response) {
    try {
      const userInfo = await this.authService.login(userId, password);
      const responseUserInfo = this.convertDtoService.camelCaseToSnakeCase(userInfo);
      return response.status(HttpStatus.OK).json(responseUserInfo);
    }
    catch(_error) {
      return response.status(HttpStatus.UNAUTHORIZED).json({ error: 'ユーザ名・パスワードが正しくありません' });
    }
  }
}
