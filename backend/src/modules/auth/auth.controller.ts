import { Body, Controller, HttpStatus, Logger, Post, Res } from '@nestjs/common';

import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { AuthService } from './auth.service';

import type { Result } from '../../common/types/result';
import type { UserApi } from '../../common/types/user';
import type { Response } from 'express';

/** Auth Controller */
@Controller('/api/auth')
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name);
  
  constructor(private readonly authService: AuthService) { }
  
  /** ログイン認証する */
  @Post('login')
  public async login(@Body() userInfoApi: UserApi, @Res() response: Response): Promise<Response<Result<UserApi>>> {
    try {
      const { userId, password } = snakeToCamelCaseObject(userInfoApi);
      const loginResult = await this.authService.login(userId, password);  // Throws
      if(loginResult.error != null) return response.status(HttpStatus.UNAUTHORIZED).json({ error: loginResult.error });
      
      const result: UserApi = camelToSnakeCaseObject(loginResult.result);
      return response.status(HttpStatus.OK).json({ result });
    }
    catch(error) {
      this.logger.error('ログイン認証失敗 (恐らく JWT 署名エラー)', error);
      return response.status(HttpStatus.UNAUTHORIZED).json({ error: 'ユーザ名・パスワードが正しくありません' });
    }
  }
}
