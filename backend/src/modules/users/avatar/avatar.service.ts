import { NestMinioService } from 'nestjs-minio';
import * as path from 'node:path';
import sharp from 'sharp';
import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { commonUserConstants } from '../../../common/constants/user-constants';
import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { UserEntity } from '../../../shared/entities/user.entity';

import type { Result } from '../../../common/types/result';

/** Avatar Service */
@Injectable()
export class AvatarService {
  private readonly logger: Logger = new Logger(AvatarService.name);
  
  constructor(
    @InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
    private readonly nestMinioService: NestMinioService,
  ) { }
  
  /** バケットがなければ作成する */
  public async onModuleInit(): Promise<void> {
    try {
      const existsBucket = await this.nestMinioService.getMinio().bucketExists(commonUserConstants.bucketName);
      if(existsBucket) {
        this.logger.debug('アバター用のバケット作成済');
      }
      else {
        this.logger.debug('アバター用のバケット未作成・作成開始');
        await this.nestMinioService.getMinio().makeBucket(commonUserConstants.bucketName);
        this.logger.debug('アバター用のバケット作成完了');
      }
    }
    catch(error) {
      this.logger.error('アバター用のバケットの確認・作成に失敗', error);
    }
  }
  
  /** アバター画像をアップロードする */
  public async save(userId: string, file: Express.Multer.File): Promise<Result<string>> {
    if(file.size > (commonUserConstants.avatarMaxFileSizeKb * 1024)) return { error: `ファイルサイズが ${commonUserConstants.avatarMaxFileSizeKb} KB を超えています`, code: HttpStatus.BAD_REQUEST };
    if(!file.mimetype.startsWith('image/')) return { error: '画像ファイルではありません', code: HttpStatus.BAD_REQUEST };
    
    // リサイズする
    const resizedBuffer = await this.resizeImage(file.buffer);
    // ファイル名を作成する
    const fileNameResult = this.createFileName(userId, file.originalname);
    // MinIO にアップロードする
    const avatarUrlResult = await this.putObject(resizedBuffer, file.mimetype, fileNameResult.result);
    if(avatarUrlResult.error != null) return avatarUrlResult;
    // 変更前のユーザ情報を取得する
    const beforeUserEntityResult = await this.findOneUserById(userId);
    if(beforeUserEntityResult.error != null) return beforeUserEntityResult as Result<string>;
    // 変更前のアバター画像ファイルを削除する
    const removeOldAvatarObjectResult = await this.removeObject(beforeUserEntityResult.result.avatarUrl);
    if(removeOldAvatarObjectResult.error != null) return removeOldAvatarObjectResult as Result<string>;
    // データベースを更新する
    const updateResult = await this.updateUserAvatarUrl(userId, avatarUrlResult.result);
    if(updateResult.error != null) return updateResult as Result<string>;
    // 更新したアバター画像のパスを返す
    return avatarUrlResult;
  }
  
  /** アバター画像を削除する */
  public async remove(userId: string): Promise<Result<boolean>> {
    // 変更前のユーザ情報を取得する
    const beforeUserEntityResult = await this.findOneUserById(userId);
    if(beforeUserEntityResult.error != null) return beforeUserEntityResult as Result<boolean>;
    // アバター画像ファイルが存在しなければ成功として終了する
    if(isEmptyString(beforeUserEntityResult.result.avatarUrl)) return { result: true };
    // 変更前のアバター画像ファイルを削除する
    const removeOldAvatarObjectResult = await this.removeObject(beforeUserEntityResult.result.avatarUrl);
    if(removeOldAvatarObjectResult.error != null) return removeOldAvatarObjectResult;
    // データベースを更新する
    const updateResult = await this.updateUserAvatarUrl(userId, '');  // アバター画像パスをなしにする
    if(updateResult.error != null) return updateResult;
    // 成功
    return { result: true };
  }
  
  /** リサイズする */
  private async resizeImage(buffer: Buffer): Promise<Buffer> {
    const metadata = await sharp(buffer).metadata();
    if(metadata.width > commonUserConstants.avatarMaxImageSizePx || metadata.height > commonUserConstants.avatarMaxImageSizePx) {
      return sharp(buffer).resize(commonUserConstants.avatarMaxImageSizePx, commonUserConstants.avatarMaxImageSizePx, { fit: 'inside' }).toBuffer();
    }
    return buffer;  // リサイズ不要
  }
  
  /** ファイル名を組み立てる */
  private createFileName(userId: string, originalName: string): Result<string> {
    const extName = path.extname(originalName).toLowerCase();
    if(isEmptyString(extName)) return { error: '拡張子が不正です', code: HttpStatus.BAD_REQUEST };
    
    const fileName = `avatar/${userId}-${Date.now()}${extName}`;
    return { result: fileName };
  }
  
  /** MinIO にアップロードする */
  private async putObject(buffer: Buffer, mimeType: string, fileName: string): Promise<Result<string>> {
    try {
      await this.nestMinioService.getMinio().putObject(commonUserConstants.bucketName, fileName, buffer, buffer.byteLength, {
        'Content-Type': mimeType
      });
      return { result: `/${commonUserConstants.bucketName}/${fileName}` };
    }
    catch(error) {
      this.logger.error('画像のアップロードに失敗', error);
      return { error: '画像のアップロードに失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 既存のオブジェクトを削除する */
  private async removeObject(avatarUrl: string): Promise<Result<boolean>> {
    if(isEmptyString(avatarUrl)) return { result: true };  // 削除する画像ファイルなし
    
    try {
      const objectName = avatarUrl.replace(`/${commonUserConstants.bucketName}/`, '');  // バケット名を除去しオブジェクト名を抽出する
      await this.nestMinioService.getMinio().removeObject(commonUserConstants.bucketName, objectName);
      return { result: true };
    }
    catch(error) {
      this.logger.error('既存のアバター画像の削除処理に失敗', error);
      return { error: '既存のアバター画像の削除処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** ユーザ情報を取得する */
  private async findOneUserById(userId: string): Promise<Result<UserEntity>> {
    try {
      const user = await this.usersRepository.findOneBy({ id: userId });
      if(user == null) return { error: '指定のユーザ ID のユーザは存在しません', code: HttpStatus.NOT_FOUND };
      user.passwordHash = null;
      return { result: user };
    }
    catch(error) {
      this.logger.error('ユーザ情報の取得処理に失敗', error);
      return { error: 'ユーザ情報の取得処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** ユーザ情報のアバター画像カラムを更新する */
  private async updateUserAvatarUrl(userId: string, newAvatarUrl: string): Promise<Result<boolean>> {
    try {
      const updateUserEntity = new UserEntity({ avatarUrl: newAvatarUrl });
      const updateResult = await this.usersRepository.update(userId, updateUserEntity);
      if(updateResult.affected !== 1) {
        this.logger.error('ユーザ情報のアバター画像パス更新処理 (Patch) で0件 or 2件以上の更新が発生', updateResult);
        return { error: 'ユーザ情報のアバター画像パス更新処理で問題が発生', code: HttpStatus.INTERNAL_SERVER_ERROR };
      }
      return { result: true };
    }
    catch(error) {
      this.logger.error('アバター画像アップロードに伴うユーザ情報の更新に失敗', error);
      return { error: 'アバター画像アップロードに伴うユーザ情報の更新に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
