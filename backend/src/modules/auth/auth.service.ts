import * as bcryptjs from 'bcryptjs';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserEntity } from '../../shared/entities/user.entity';
import { UsersService } from '../users/users.service';

import type { Result } from '../../common/types/result';
import type { User } from '../../common/types/user';

/** Auth Service */
@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) { }
  
  /** ログイン認証する */
  public async login(id: string, password: string): Promise<Result<User>> {
    const userEntityResult = await this.usersService.findOneByIdWithPasswordHash(id);
    if(userEntityResult.error != null) return userEntityResult;
    
    const userEntity = userEntityResult.result;
    const isValidPassword = await bcryptjs.compare(password, userEntity.passwordHash);
    if(!isValidPassword) return { error: 'パスワードに誤りがあります', code: HttpStatus.BAD_REQUEST };
    
    const result = await this.generateToken(userEntity);
    return result;
  }
  
  /** トークンをリフレッシュする */
  public async refresh(token: string, id: string): Promise<Result<User>> {
    let decodedPayload: { sub: string, role: string, iat: number, exp: number };
    try {
      decodedPayload = await this.jwtService.decode(token);
    }
    catch(error) {
      this.logger.warn('トークンのデコードに失敗', error);
      return { error: 'トークンのデコードに失敗', code: HttpStatus.UNAUTHORIZED };
    }
    
    if(decodedPayload.sub !== id) return { error: 'トークンの sub とリクエスト ID が一致しませんでした', code: HttpStatus.UNAUTHORIZED };
    
    const userEntityResult = await this.usersService.findOneByIdWithPasswordHash(id);
    if(userEntityResult.error != null) return userEntityResult;
    
    const result = await this.generateToken(userEntityResult.result);
    return result;
  }
  
  /** JWT Payload を用意してトークンを生成する */
  private async generateToken(userEntity: UserEntity): Promise<Result<User>> {
    const jwtPayload = {  // `JwtAuthGuard` の設定によりコレが `request.user` に入る
      sub : userEntity.id,
      role: userEntity.role
    };
    try {
      // レスポンスの元となるデータ (LocalStorage に格納されるため余計なデータは消しておく)
      const user: User = { ...userEntity };
      delete user.passwordHash;
      delete user.createdAt;
      delete user.updatedAt;
      user.token = await this.jwtService.signAsync(jwtPayload);  // Throws
      return { result: user };
    }
    catch(error) {
      this.logger.error('JWT 署名に失敗', error);
      return { error: 'JWT 署名に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
