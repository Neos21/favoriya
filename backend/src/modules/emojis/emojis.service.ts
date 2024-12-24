import { NestMinioService } from 'nestjs-minio';
import * as path from 'node:path';
import sharp from 'sharp';
import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EmojiEntity } from '../../shared/entities/emoji.entity';
import { emojisConstants } from '../../common/constants/emojis-constants';
import { isEmptyString } from '../../common/helpers/is-empty-string';

import type { Result } from '../../common/types/result';

/** Emojis Service */
@Injectable()
export class EmojisService {
  private readonly logger: Logger = new Logger(EmojisService.name);
  
  constructor(
    @InjectRepository(EmojiEntity) private readonly emojisRepository: Repository<EmojiEntity>,
    private readonly nestMinioService: NestMinioService
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
  
  /** 絵文字リアクション情報一覧を削除する */
  public async findAll(): Promise<Result<Array<EmojiEntity>>> {
    try {
      const emojiEntities = await this.emojisRepository.find({ order: { createdAt: 'DESC' }});
      return { result: emojiEntities };
    }
    catch(error) {
      this.logger.error('絵文字リアクション一覧の取得に失敗', error);
      return { error: '絵文字リアクション一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 絵文字リアクション画像をアップロードする */
  public async create(name: string, file: Express.Multer.File): Promise<Result<string>> {
    if(file.size > (emojisConstants.maxFileSizeKb * 1024)) return { error: `ファイルサイズが ${emojisConstants.maxFileSizeKb} KB を超えています`, code: HttpStatus.BAD_REQUEST };
    if(!file.mimetype.startsWith('image/')) return { error: '画像ファイルではありません', code: HttpStatus.BAD_REQUEST };
    
    // リサイズする
    const resizedBuffer = await this.resizeImage(file.buffer, file.mimetype);
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
  
  /** リサイズする */
  private async resizeImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    if(mimeType === 'image/gif') return buffer;  // sharp を通すとアニメーション GIF が動かなくなるので GIF は変換しないことにする
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
}
