import { Body, Controller, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthService } from './auth.service';

import type { Result } from '../../common/types/result';
import type { UserApi } from '../../common/types/user';
import type { Request, Response } from 'express';

/** Auth Controller */
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  
  /** ログイン認証する */
  @Post('login')
  public async login(@Body() userInfoApi: UserApi, @Req() request: Request, @Res() response: Response): Promise<Response<Result<UserApi>>> {
    const { id, password } = snakeToCamelCaseObject(userInfoApi);
    const loginResult = await this.authService.login(id, password);
    if(loginResult.error != null) return response.status(HttpStatus.UNAUTHORIZED).json(loginResult);
    
    await this.authService.saveLoginHistory(request, id);
    
    const result: UserApi = camelToSnakeCaseObject(loginResult.result);
    return response.status(HttpStatus.OK).json({ result });
  }
  
  /** トークンをリフレッシュする */
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  public async refresh(@Body('id') id: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<UserApi>>> {
    const refreshResult = await this.authService.refresh(id);
    if(refreshResult.error != null) return response.status(refreshResult.code ?? HttpStatus.UNAUTHORIZED).json(refreshResult);
    
    await this.authService.saveLoginHistory(request, id);
    
    const result: UserApi = camelToSnakeCaseObject(refreshResult.result);
    return response.status(HttpStatus.OK).json({ result });
  }
}
