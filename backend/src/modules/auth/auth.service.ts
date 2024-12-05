import * as bcryptjs from 'bcryptjs';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';

import type { Result } from '../../common/types/result';
import type { User } from '../../common/types/user';

/** Auth Service */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) { }
  
  /** ログイン認証する */
  public async login(id: string, password: string): Promise<Result<User>> {
    const userResult = await this.usersService.findOneById(id);
    if(userResult.error != null) return { error: userResult.error };
    
    const userEntity = userResult.result;
    const isValidPassword = await bcryptjs.compare(password, userEntity.passwordHash);
    if(!isValidPassword) return { error: 'パスワードに誤りがあります' };
    
    const jwtPayload = {  // `JwtAuthGuard` の設定によりコレが `request.user` に入る
      sub : userEntity.id,
      role: userEntity.role
    };
    const result: User = {  // レスポンスの元となるデータ
      id   : userEntity.id,
      name : userEntity.name,
      role : userEntity.role,
      token: await this.jwtService.signAsync(jwtPayload)  // Throws
    };
    return { result };
  }
}
