import { NestMinioService } from 'nestjs-minio';
import * as path from 'node:path';
import sharp from 'sharp';
import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { emojisConstants } from '../../../common/constants/emojis-constants';
import { isEmptyString } from '../../../common/helpers/is-empty-string';
import { EmojiEntity } from '../../../shared/entities/emoji.entity';

import type { Result } from '../../../common/types/result';

/** Admin Emojis Service */
@Injectable()
export class AdminEmojisService {
  private readonly logger: Logger = new Logger(AdminEmojisService.name);
  
  constructor(
    @InjectRepository(EmojiEntity) private readonly emojisRepository: Repository<EmojiEntity>,
    private readonly nestMinioService: NestMinioService,
  ) { }
  
  /** バケットがなければ作成する */
  public async onModuleInit(): Promise<void> {
    try {
      const existsBucket = await this.nestMinioService.getMinio().bucketExists(emojisConstants.bucketName);
      if(existsBucket) {
        this.logger.debug('絵文字リアクション用のバケット作成済');
      }
      else {
        this.logger.debug('絵文字リアクション用のバケット未作成・作成開始');
        await this.nestMinioService.getMinio().makeBucket(emojisConstants.bucketName);
        this.logger.debug('絵文字リアクション用のバケット作成完了');
      }
    }
    catch(error) {
      this.logger.error('絵文字リアクション用のバケットの確認・作成に失敗', error);
    }
  }
  
  /** 絵文字リアクション画像をアップロードする */
  public async create(name: string, file: Express.Multer.File): Promise<Result<string>> {
    if(file.size > (emojisConstants.maxFileSizeKb * 1024)) return { error: `ファイルサイズが ${emojisConstants.maxFileSizeKb} KB を超えています`, code: HttpStatus.BAD_REQUEST };
    if(!file.mimetype.startsWith('image/')) return { error: '画像ファイルではありません', code: HttpStatus.BAD_REQUEST };
    
    // リサイズする
    const resizedBuffer = await this.resizeImage(file.buffer);
    // ファイル名を作成する
    const fileNameResult = this.createFileName(name, file.originalname);
    // MinIO にアップロードする
    const imageUrlResult = await this.putObject(resizedBuffer, file.mimetype, fileNameResult.result);
    if(imageUrlResult.error != null) return imageUrlResult;
    // データベースを登録する
    const insertResult = await this.insertEmoji(name, imageUrlResult.result);
    if(insertResult.error != null) return insertResult as Result<string>;
    // 登録した絵文字リアクション画像のパスを返す
    return imageUrlResult;
  }
  
  /** 絵文字リアクション画像を削除する */
  public async remove(id: number): Promise<Result<boolean>> {
    // 絵文字リアクション情報を取得する
    const emojiEntityResult = await this.findOneById(id);
    if(emojiEntityResult.error != null) return emojiEntityResult as Result<boolean>;
    // 絵文字リアクション画像ファイルを削除する
    const removeOldAvatarObjectResult = await this.removeObject(emojiEntityResult.result.imageUrl);
    if(removeOldAvatarObjectResult.error != null) return removeOldAvatarObjectResult;
    // データベースを削除する
    const deleteResult = await this.deleteEmoji(id);
    if(deleteResult.error != null) return deleteResult;
    // 成功
    return { result: true };
  }
  
  /** リサイズする */
  private async resizeImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).resize(null, emojisConstants.maxImageHeightPx, { fit: 'inside' }).toBuffer();
  }
  
  /** ファイル名を組み立てる */
  private createFileName(name: string, originalName: string): Result<string> {
    const extName = path.extname(originalName).toLowerCase();
    if(isEmptyString(extName)) return { error: '拡張子が不正です', code: HttpStatus.BAD_REQUEST };
    
    const fileName = `${name}${extName}`;
    return { result: fileName };
  }
  
  /** MinIO にアップロードする */
  private async putObject(buffer: Buffer, mimeType: string, fileName: string): Promise<Result<string>> {
    try {
      await this.nestMinioService.getMinio().putObject(emojisConstants.bucketName, fileName, buffer, buffer.byteLength, {
        'Content-Type': mimeType
      });
      return { result: `/${emojisConstants.bucketName}/${fileName}` };
    }
    catch(error) {
      this.logger.error('画像のアップロードに失敗', error);
      return { error: '画像のアップロードに失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 絵文字リアクション情報を DB 登録する */
  private async insertEmoji(name: string, imageUrl: string): Promise<Result<boolean>> {
    try {
      const emojiEntity = new EmojiEntity({ name, imageUrl });
      await this.emojisRepository.insert(emojiEntity);
      return { result: true };
    }
    catch(error) {
      this.logger.error('絵文字リアクション画像アップロードに伴う DB 登録に失敗', error);
      return { error: '絵文字リアクション画像アップロードに伴う DB 登録に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 絵文字リアクション情報を取得する */
  private async findOneById(id: number): Promise<Result<EmojiEntity>> {
    try {
      const emojiEntity = await this.emojisRepository.findOneBy({ id });
      if(emojiEntity == null) return { error: '指定 ID の絵文字リアクションは存在しません', code: HttpStatus.NOT_FOUND };
      return { result: emojiEntity };
    }
    catch(error) {
      this.logger.error('絵文字リアクション情報の取得に失敗', error);
      return { error: '絵文字リアクション情報の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 既存のオブジェクトを削除する */
  private async removeObject(imageUrl: string): Promise<Result<boolean>> {
    try {
      const objectName = imageUrl.replace(`/${emojisConstants.bucketName}/`, '');  // バケット名を除去しオブジェクト名を抽出する
      await this.nestMinioService.getMinio().removeObject(emojisConstants.bucketName, objectName);
      return { result: true };
    }
    catch(error) {
      this.logger.error('絵文字リアクション画像の削除に失敗', error);
      return { error: '絵文字リアクション画像の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 絵文字リアクション情報を削除する */
  private async deleteEmoji(id: number): Promise<Result<boolean>> {
    try {
      const deleteResult = await this.emojisRepository.delete({ id });
      if(deleteResult.affected !== 1) return { error: '指定 ID の絵文字リアクションの削除中に問題が発生', code: HttpStatus.INTERNAL_SERVER_ERROR };
      return { result: true };
    }
    catch(error) {
      this.logger.error('絵文字リアクション情報の削除に失敗', error);
      return { error: '絵文字リアクション情報の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
