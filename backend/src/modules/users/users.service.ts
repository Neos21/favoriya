import * as bcryptjs from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { authUserConstants } from '../../shared/constants/auth-user';
import { UserEntity } from '../../shared/entities/user.entity';

import type { User } from '../../shared/types/user';

/** Users Service */
@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>) { }
  
  /** ユーザ登録する */
  public async create(user: User): Promise<{ error?: string }> {
    // 入力チェックをする
    const errorUserId = this.validateUserId(user.userId);
    if(errorUserId) return { error: errorUserId };
    const errorPassword = this.validatePassword(user.password);
    if(errorPassword) return { error: errorPassword };
    
    // パスワードをハッシュ化する
    const salt = await bcryptjs.genSalt(authUserConstants.saltRounds);
    const passwordHash = await bcryptjs.hash(user.password, salt);
    
    // DB 登録する
    const newUserEntity = new UserEntity({ userId: user.userId, passwordHash, role: 'Normal' });
    try {
      await this.usersRepository.insert(newUserEntity);  // Throws
    }
    catch(error) {
      if(error instanceof QueryFailedError && (error as any).code === '23505') return { error: 'そのユーザ ID は既に使用されています' };
      throw error;  // その他のエラーは Internal Server Error とする
    }
    
    return {};  // 成功
  }
  
  
  /** COMMON : ユーザ ID の入力チェック */
  private validateUserId = (userId: string): string | null => {
    if(userId.trim() === '') return 'ユーザ ID を入力してください';
    if(!/^[a-z0-9-]+$/.test(userId)) return 'ユーザ ID は数字・英小文字・ハイフンのみ使用できます';
    if(userId.length > 25) return 'ユーザ ID は25文字以内である必要があります';
    return null;  // バリデーション成功
  };
  
  /** COMMON : パスワードの入力チェック */
  private validatePassword = (password: string): string | null => {
    if(password.trim() === '') return 'パスワードを入力してください';
    if(!/^[\w!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/.test(password)) return 'パスワードは半角英数字と記号のみ使用できます';
    if(password.length < 8 || password.length > 16) return 'パスワードは8文字以上16文字以内である必要があります';
    return null;  // バリデーション成功
  };
}
