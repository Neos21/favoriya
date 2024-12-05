import * as bcryptjs from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isValidId, isValidPassword } from '../../common/helpers/validators/validator-user';
import { authUserConstants } from '../../shared/constants/auth-user';
import { UserEntity } from '../../shared/entities/user.entity';

import type { Result } from '../../common/types/result';
import type { User } from '../../common/types/user';

/** Users Service */
@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name);
  
  constructor(@InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>) { }
  
  /** ユーザ登録する */
  public async create(user: User): Promise<Result<boolean>> {
    // 入力チェックをする
    const validateResultId = isValidId(user.id);
    if(validateResultId.error != null) return { error: validateResultId.error };
    const validateResultPassword = isValidPassword(user.password);
    if(validateResultPassword.error != null ) return { error: validateResultPassword.error };
    
    // パスワードをハッシュ化する
    const salt = await bcryptjs.genSalt(authUserConstants.saltRounds);
    const passwordHash = await bcryptjs.hash(user.password, salt);
    
    // DB 登録する
    const newUserEntity = new UserEntity({
      id: user.id,
      passwordHash,
      name: '未設定',
      role: 'Normal'
    });
    try {
      await this.usersRepository.insert(newUserEntity);  // Throws
    }
    catch(error) {
      if(error instanceof QueryFailedError && (error as any).code === '23505') return { error: 'そのユーザ ID は既に使用されています' };
      this.logger.error('ユーザ登録処理に失敗しました (DB エラー)', error);
      throw error;  // その他のエラーは Internal Server Error とするため Throw する
    }
    
    return { result: true };  // 成功
  }
  
  /** ユーザ ID を条件にユーザ情報を取得する */
  public async findOneById(id: string): Promise<Result<UserEntity>> {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if(user == null) return { error: '指定のユーザ ID のユーザは存在しません' };
      return { result: user };
    }
    catch(error) {
      this.logger.error('ユーザ情報の取得処理に失敗しました (DB エラー)', error);
      return { error: 'ユーザ情報の取得処理に失敗しました' };
    }
  }
}
