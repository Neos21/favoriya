import * as bcryptjs from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isValidId, isValidName, isValidPassword, isValidProfileText } from '../../common/helpers/validators/validator-user';
import { authUserConstants } from '../../shared/constants/auth-user-constants';
import { UserEntity } from '../../shared/entities/user.entity';

import type { Result } from '../../common/types/result';
import type { User } from '../../common/types/user';

/** Users Service */
@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name);
  
  constructor(@InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>) { }
  
  /** システムユーザを登録する */
  public async onModuleInit(): Promise<void> {
    try {
      const existsAnonymous = await this.usersRepository.findOneBy({ id: 'anonymous' });
      if(existsAnonymous != null) {
        this.logger.debug('匿名さん作成済');
      }
      else {
        const insertResult = await this.usersRepository.insert(new UserEntity({
          id          : 'anonymous',
          passwordHash: '',
          name        : '匿名さん',
          role        : 'Anonymous',
          profileText : '匿名投稿用のユーザです',
          createdAt   : new Date(0),
          updatedAt   : new Date(0)
        }));
        this.logger.debug('匿名さんを作成', JSON.stringify(insertResult));
      }
      
      const existsShumai = await this.usersRepository.findOneBy({ id: 'shumai' });
      if(existsShumai != null) {
        this.logger.debug('しゅうまい君作成済');
      }
      else {
        const insertResult = await this.usersRepository.insert(new UserEntity({
          id          : 'shumai',
          passwordHash: '',
          name        : 'しゅうまい君',
          role        : 'Shumai',
          avatarUrl   : '/users/avatar/shumai.png',
          profileText : 'マルコフ連鎖で生成した文章を投稿します',
          createdAt   : new Date(0),
          updatedAt   : new Date(0)
        }));
        this.logger.debug('しゅうまい君を作成', JSON.stringify(insertResult));
      }
    }
    catch(error) {
      this.logger.warn('システムユーザの作成に失敗', error);
    }
  }
  
  /** ユーザ登録する */
  public async create(user: User): Promise<Result<boolean>> {
    // 入力チェックをする
    const validateResultId = isValidId(user.id);
    if(validateResultId.error != null) return validateResultId;
    const validateResultPassword = isValidPassword(user.password);
    if(validateResultPassword.error != null) return validateResultPassword;
    
    // パスワードをハッシュ化する
    const salt = await bcryptjs.genSalt(authUserConstants.saltRounds);
    const passwordHash = await bcryptjs.hash(user.password, salt);
    
    // DB 登録する
    const newUserEntity = new UserEntity({ id: user.id, passwordHash, name: user.id });
    try {
      await this.usersRepository.insert(newUserEntity);
      return { result: true };  // 成功
    }
    catch(error) {
      if(error instanceof QueryFailedError && (error as unknown as { code: string }).code === '23505') return { error: 'そのユーザ ID は既に使用されています', code: HttpStatus.BAD_REQUEST };
      this.logger.error('ユーザ登録処理に失敗', error);
      return { error: 'ユーザ登録処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** ユーザ情報一覧を取得する */
  public async findAll(): Promise<Result<Array<UserEntity>>> {
    try {
      const users = await this.usersRepository.find({
        select: {
          id       : true,
          name     : true,
          role     : true,
          avatarUrl: true,
          createdAt: true
        },
        order: { createdAt: 'DESC' }
      });
      return { result: users };
    }
    catch(error) {
      this.logger.error('ユーザ情報一覧の取得処理に失敗', error);
      return { error: 'ユーザ情報一覧の取得処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** ユーザ ID を条件にユーザ情報を取得する (パスワードハッシュは取得しない) */
  public async findOneById(id: string): Promise<Result<UserEntity>> {
    const userResult = await this.findOneByIdWithPasswordHash(id);
    if(userResult.error != null) return userResult;
    
    delete userResult.result.passwordHash;  // パスワードハッシュ欄をクリアする
    return userResult;
  }
  
  /** ユーザ ID を条件にユーザ情報を取得する (パスワードハッシュも取得する) */
  public async findOneByIdWithPasswordHash(id: string): Promise<Result<UserEntity>> {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if(user == null) return { error: '指定のユーザ ID のユーザは存在しません', code: HttpStatus.NOT_FOUND };
      return { result: user };
    }
    catch(error) {
      this.logger.error('ユーザ情報の取得処理に失敗', error);
      return { error: 'ユーザ情報の取得処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** ユーザ情報を一部更新する */
  public async patch(id: string, user: User): Promise<Result<User>> {
    const updateUserEntity = new UserEntity({});
    
    // 入力チェックしながら値を格納していく
    if(user.name != null) {
      const validateResultName = isValidName(user.name);
      if(validateResultName.error != null) return validateResultName as Result<User>;
      updateUserEntity.name = user.name;
    }
    if(user.profileText != null) {
      const validateResultProfileText = isValidProfileText(user.profileText);
      if(validateResultProfileText.error != null) return validateResultProfileText as Result<User>;
      updateUserEntity.profileText = user.profileText;
    }
    if(user.showOwnFavouritesCount != null) updateUserEntity.showOwnFavouritesCount = user.showOwnFavouritesCount;
    if(user.showOthersFavouritesCount != null) updateUserEntity.showOthersFavouritesCount = user.showOthersFavouritesCount;
    
    try {
      const updateResult = await this.usersRepository.update(id, updateUserEntity);
      if(updateResult.affected !== 1) {  // 1件だけ更新が成功していない場合
        this.logger.error('ユーザ情報の更新処理 (Patch) で0件 or 2件以上の更新が発生', updateResult);
        return { error: 'ユーザ情報の更新処理で問題が発生', code: HttpStatus.INTERNAL_SERVER_ERROR };
      }
      return await this.findOneById(id) as Result<User>;
    }
    catch(error) {
      this.logger.error('ユーザ情報の更新処理 (Patch) に失敗', error);
      return { error: 'ユーザ情報の更新処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** パスワードを変更する */
  public async changePassword(id: string, currentPassword: string, newPassword: string): Promise<Result<boolean>> {
    // ユーザの存在チェック
    const userResult = await this.findOneByIdWithPasswordHash(id);
    if(userResult.error != null) return userResult as Result<boolean>;
    
    // 現在のパスワードの一致チェック
    const userEntity = userResult.result;
    const isValidCurrentPassword = await bcryptjs.compare(currentPassword, userEntity.passwordHash);
    if(!isValidCurrentPassword) return { error: '現在のパスワードが誤っています', code: HttpStatus.BAD_REQUEST };
    
    // 新規パスワードの入力チェック
    const validateResultNewPassword = isValidPassword(newPassword);
    if(validateResultNewPassword.error != null) return validateResultNewPassword;
    
    // 現在のパスワードと新規パスワードが同じ場合はエラーにする
    if(currentPassword === newPassword) return { error: '同じパスワード文字列が入力されています', code: HttpStatus.BAD_REQUEST };
    
    // 新規パスワードをハッシュ化する
    const salt = await bcryptjs.genSalt(authUserConstants.saltRounds);
    const passwordHash = await bcryptjs.hash(newPassword, salt);
    
    // DB 更新する
    const updateUserEntity = new UserEntity({ passwordHash });
    try {
      const updateResult = await this.usersRepository.update(id, updateUserEntity);
      if(updateResult.affected !== 1) {  // 1件だけ更新が成功していない場合
        this.logger.error('ユーザパスワードの更新処理で0件 or 2件以上の更新が発生', updateResult);
        return { error: 'ユーザパスワードの更新処理で問題が発生', code: HttpStatus.INTERNAL_SERVER_ERROR };
      }
      return { result: true };  // 成功
    }
    catch(error) {
      this.logger.error('ユーザパスワードの更新処理に失敗', error);
      return { error: 'ユーザパスワードの更新処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
