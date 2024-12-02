import { Response } from 'express';

import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';

/** Auth Controller */
@Controller('/api/auth')
export class AuthController {
  /** Log In */
  @Post('login')
  public async login(@Body() loginDto: { user_name: string; password: string }, @Res() response: Response) {
    const userName = loginDto.user_name;
    const password = loginDto.password;
    
    // TODO : 認証ロジックを追加する
    if(userName === 'user' && password === 'pass') {
      return response.status(HttpStatus.OK).json({ message: 'ログイン成功', token: 'dummy-jwt-token' });
    }
    else {
      return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'ログイン失敗', error: '無効な認証情報' });
    }
  }
}
