import * as bcryptjs from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isValidId, isValidName, isValidPassword } from '../../common/helpers/validators/validator-user';
import { authUserConstants } from '../../shared/constants/auth-user';
import { UserEntity } from '../../shared/entities/user.entity';

import type { Result } from '../../common/types/result';
import type { User } from '../../common/types/user';

/** Users Service */
@Injectable()
export class UsersService {
  public readonly userNotFoundErrorMessage: string = '指定のユーザ ID のユーザは存在しません';
  
  private readonly logger: Logger = new Logger(UsersService.name);
  
  constructor(@InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>) { }
  
  /** ユーザ登録する */
  public async create(user: User): Promise<Result<boolean>> {
    // 入力チェックをする
    const validateResultId = isValidId(user.id);
    if(validateResultId.error != null) return { error: validateResultId.error };
    const validateResultPassword = isValidPassword(user.password);
    if(validateResultPassword.error != null) return { error: validateResultPassword.error };
    
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
      await this.usersRepository.insert(newUserEntity);
      return { result: true };  // 成功
    }
    catch(error) {
      if(error instanceof QueryFailedError && (error as unknown as { code: string }).code === '23505') return { error: 'そのユーザ ID は既に使用されています' };
      this.logger.error('ユーザ登録処理に失敗しました (DB エラー)', error);
      throw error;  // その他のエラーは Internal Server Error とする
    }
  }
  
  /** ユーザ ID を条件にユーザ情報を取得する (パスワードハッシュは取得しない) */
  public async findOneById(id: string): Promise<Result<UserEntity>> {
    const userResult = await this.findOneByIdWithPasswordHash(id);
    if(userResult.error) return userResult;
    
    userResult.result.passwordHash = null;  // パスワードハッシュ欄をクリアする
    return userResult;
  }
  
  /** ユーザ ID を条件にユーザ情報を取得する (パスワードハッシュも取得する) */
  public async findOneByIdWithPasswordHash(id: string): Promise<Result<UserEntity>> {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if(user == null) return { error: this.userNotFoundErrorMessage };
      return { result: user };
    }
    catch(error) {
      this.logger.error('ユーザ情報の取得処理に失敗しました (DB エラー)', error);
      return { error: 'ユーザ情報の取得処理に失敗しました' };
    }
  }
  
  /** ユーザ情報を一部更新する */
  public async patch(id: string, user: User): Promise<Result<User>> {
    const updateUserEntity = new UserEntity({});
    
    // 入力チェックしながら値を格納していく
    if(user.name != null) {
      const validateResultName = isValidName(user.name);
      if(validateResultName.error != null) return { error: validateResultName.error };
      updateUserEntity.name = user.name;
    }
    
    try {
      const updateResult = await this.usersRepository.update(id, updateUserEntity);
      if(updateResult.affected !== 1) {  // 1件だけ更新が成功していない場合
        this.logger.error('ユーザ情報更新処理 (Patch) で0件 or 2件以上の更新が発生', updateResult);
        throw new Error('Invalid Affected');
      }
      return await this.findOneById(id);
    }
    catch(error) {
      this.logger.error('ユーザ情報更新処理 (Patch) に失敗しました (DB エラー)', error);
      throw error;
    }
  }
  
  /** パスワードを変更する */
  public async changePassword(id: string, currentPassword: string, newPassword: string): Promise<Result<boolean>> {
    // ユーザの存在チェック
    const userResult = await this.findOneByIdWithPasswordHash(id);
    if(userResult.error != null) return { error: userResult.error };
    
    // 現在のパスワードの一致チェック
    const userEntity = userResult.result;
    const isValidCurrentPassword = await bcryptjs.compare(currentPassword, userEntity.passwordHash);
    if(!isValidCurrentPassword) return { error: '現在のパスワードが誤っています' };
    
    // 新規パスワードの入力チェック
    const validateResultNewPassword = isValidPassword(newPassword);
    if(validateResultNewPassword.error != null) return { error: validateResultNewPassword.error };
    
    // 現在のパスワードと新規パスワードが同じ場合はエラーにする
    if(currentPassword === newPassword) return { error: '同じパスワード文字列が入力されています' };
    
    // 新規パスワードをハッシュ化する
    const salt = await bcryptjs.genSalt(authUserConstants.saltRounds);
    const passwordHash = await bcryptjs.hash(newPassword, salt);
    
    // DB 更新する
    const updateUserEntity = new UserEntity({ passwordHash });
    try {
      const updateResult = await this.usersRepository.update(id, updateUserEntity);
      if(updateResult.affected !== 1) {  // 1件だけ更新が成功していない場合
        this.logger.error('ユーザパスワードの変更処理で0件 or 2件以上の更新が発生', updateResult);
        throw new Error('Invalid Affected');
      }
      return { result: true };  // 成功
    }
    catch(error) {
      this.logger.error('ユーザパスワードの変更処理に失敗しました (DB エラー)', error);
      throw error;
    }
  }
}
