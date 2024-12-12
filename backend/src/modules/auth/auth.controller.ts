import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';

import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { AuthService } from './auth.service';

import type { Result } from '../../common/types/result';
import type { UserApi } from '../../common/types/user';
import type { Response } from 'express';

/** Auth Controller */
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  
  /** ログイン認証する */
  @Post('login')
  public async login(@Body() userInfoApi: UserApi, @Res() response: Response): Promise<Response<Result<UserApi>>> {
    const { id, password } = snakeToCamelCaseObject(userInfoApi);
    const loginResult = await this.authService.login(id, password);
    if(loginResult.error != null) return response.status(HttpStatus.UNAUTHORIZED).json(loginResult);
    
    const result: UserApi = camelToSnakeCaseObject(loginResult.result);
    return response.status(HttpStatus.OK).json({ result });
  }
}
