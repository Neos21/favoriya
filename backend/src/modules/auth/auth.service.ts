import * as bcryptjs from 'bcryptjs';
import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { LoginHistoryEntity } from '../../shared/entities/login-history.entity';
import { UserEntity } from '../../shared/entities/user.entity';
import { UsersService } from '../users/users.service';

import type { Request } from 'express';
import type { Result } from '../../common/types/result';
import type { User } from '../../common/types/user';

/** Auth Service */
@Injectable()
export class AuthService {
  /** 1ユーザにつき残すログイン履歴の最大件数 */
  private readonly keepLoginHistoriesPerUser: number = 10;
  
  private readonly logger: Logger = new Logger(AuthService.name);
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @InjectRepository(LoginHistoryEntity) private readonly loginHistoriesRepository: Repository<LoginHistoryEntity>
  ) { }
  
  /** ログイン認証する */
  public async login(id: string, password: string): Promise<Result<User>> {
    const userEntityResult = await this.usersService.findOneByIdWithPasswordHash(id);
    if(userEntityResult.error != null) return userEntityResult as Result<User>;
    
    const userEntity = userEntityResult.result;
    const isValidPassword = await bcryptjs.compare(password, userEntity.passwordHash);
    if(!isValidPassword) return { error: 'パスワードに誤りがあります', code: HttpStatus.BAD_REQUEST };
    
    const result = await this.generateToken(userEntity);
    return result;
  }
  
  /** トークンをリフレッシュする */
  public async refresh(id: string): Promise<Result<User>> {
    const userEntityResult = await this.usersService.findOneByIdWithPasswordHash(id);
    if(userEntityResult.error != null) return userEntityResult as Result<User>;
    
    const result = await this.generateToken(userEntityResult.result);
    return result;
  }
  
  /** ログイン履歴を保存する */
  public async saveLoginHistory(request: Request, id: string): Promise<Result<boolean>> {
    const ip = (request.headers as unknown as { ip          : string }).ip            ?? '-';
    const ua = (request.headers as unknown as { 'user-agent': string })['user-agent'] ?? '-';
    const loginHistoryEntity = new LoginHistoryEntity({ userId: id, ip, ua });
    try {
      await this.loginHistoriesRepository.upsert(loginHistoryEntity, {
        conflictPaths: ['userId', 'ip', 'ua'],
        skipUpdateIfNoValuesChanged: false
      });
    }
    catch(error) {
      this.logger.warn('ログイン履歴の保存に失敗', error);
    }
    // 古い履歴を削除する (最新の指定件数のみ保持する)
    try {
      const oldRecords = await this.loginHistoriesRepository
        .createQueryBuilder('login_histories')
        .where('user_id = :userId', { userId: id })
        .orderBy('updated_at', 'DESC')
        .skip(this.keepLoginHistoriesPerUser)  // 最新の指定件数は除外する
        .getMany();
      if(oldRecords.length > 0) {
        for await (const oldRecord of oldRecords) {
          await this.loginHistoriesRepository.delete({
            userId: oldRecord.userId,
            ip    : oldRecord.ip,
            ua    : oldRecord.ua
          });
        }
      }
    }
    catch(error) {
      this.logger.warn('古いログイン履歴の削除に失敗', error);
    }
    return { result: true };  // 必ず成功にする
  }
  
  /** JWT Payload を用意してトークンを生成する */
  private async generateToken(userEntity: UserEntity): Promise<Result<User>> {
    const jwtPayload = {  // `JwtAuthGuard` の設定によりコレが `request.user` に入る
      sub : userEntity.id,
      role: userEntity.role
    };
    try {
      // レスポンスの元となるデータ (LocalStorage に格納されるため余計なデータは消しておく)
      const user: User = { ...userEntity } as unknown as User;
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
