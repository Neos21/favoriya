import { NestMinioService } from 'nestjs-minio';
import * as path from 'node:path';
import sharp from 'sharp';
import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { commonEmojisConstants } from '../../common/constants/emojis-constants';
import { isEmptyString } from '../../common/helpers/is-empty-string';
import { EmojiEntity } from '../../shared/entities/emoji.entity';

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
      const existsBucket = await this.nestMinioService.getMinio().bucketExists(commonEmojisConstants.bucketName);
      if(existsBucket) {
        this.logger.debug('絵文字リアクション用のバケット作成済');
      }
      else {
        this.logger.debug('絵文字リアクション用のバケット未作成・作成開始');
        await this.nestMinioService.getMinio().makeBucket(commonEmojisConstants.bucketName);
        this.logger.debug('絵文字リアクション用のバケット作成完了');
      }
    }
    catch(error) {
      this.logger.error('絵文字リアクション用のバケットの確認・作成に失敗', error);
    }
  }
  
  /** 絵文字リアクション情報一覧を取得する */
  public async findAll(): Promise<Result<Array<EmojiEntity>>> {
    try {
      const emojiEntities = await this.emojisRepository.find({ order: { name: 'ASC' }});
      return { result: emojiEntities };
    }
    catch(error) {
      this.logger.error('絵文字リアクション一覧の取得に失敗', error);
      return { error: '絵文字リアクション一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 絵文字リアクション画像をアップロードする */
  public async create(name: string, file: Express.Multer.File): Promise<Result<string>> {
    if(file.size > (commonEmojisConstants.maxFileSizeKb * 1024)) return { error: `ファイルサイズが ${commonEmojisConstants.maxFileSizeKb} KB を超えています`, code: HttpStatus.BAD_REQUEST };
    if(!file.mimetype.startsWith('image/')) return { error: '画像ファイルではありません', code: HttpStatus.BAD_REQUEST };
    // 同名の絵文字リアクションがないか存在チェックする
    const findOneByNameResult = await this.findOneByName(name);
    if(findOneByNameResult.error != null) return findOneByNameResult as Result<string>;
    // リサイズする
    const resizedBufferResult = await this.resizeImage(file.buffer, file.mimetype);
    if(resizedBufferResult.error != null) return resizedBufferResult as Result<string>;
    // ファイル名を作成する
    const fileNameResult = this.createFileName(name, file.originalname);
    if(fileNameResult.error != null) return fileNameResult;
    // MinIO にアップロードする
    const imageUrlResult = await this.putObject(resizedBufferResult.result, file.mimetype, fileNameResult.result);
    if(imageUrlResult.error != null) return imageUrlResult;
    // データベースを登録する
    const insertResult = await this.insertEmoji(name, imageUrlResult.result);
    if(insertResult.error != null) return insertResult as Result<string>;
    // 登録した絵文字リアクション画像のパスを返す
    return imageUrlResult;
  }
  
  /** お絵描きモードから絵文字リアクション画像をアップロードする */
  public async createFromDrawing(name: string, buffer: Buffer): Promise<Result<string>> {
    // 同名の絵文字リアクションがないか存在チェックする
    const findOneByNameResult = await this.findOneByName(name);
    if(findOneByNameResult.error != null) return findOneByNameResult as Result<string>;
    // ファイル名を作成する
    const fileNameResult = this.createFileName(name, 'drawing.png');
    if(fileNameResult.error != null) return fileNameResult;
    // MinIO にアップロードする
    const imageUrlResult = await this.putObject(buffer, 'image/png', fileNameResult.result);
    if(imageUrlResult.error != null) return imageUrlResult;
    // データベースを登録する
    const insertResult = await this.insertEmoji(name, imageUrlResult.result);
    if(insertResult.error != null) return insertResult as Result<string>;
    // 登録した絵文字リアクション画像のパスを返す
    return imageUrlResult;
  }
  
  /** 存在チェック */
  private async findOneByName(name: string): Promise<Result<boolean>> {
    try {
      const emojiEntity = await this.emojisRepository.findOneBy({ name });
      if(emojiEntity != null) return { error: '同名の絵文字リアクションが既に登録されています', code: HttpStatus.BAD_REQUEST };
      return { result: true };
    }
    catch(error) {
      this.logger.error('絵文字リアクション画像アップロードに伴う DB 登録に失敗', error);
      return { error: '絵文字リアクション画像アップロードに伴う DB 登録に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** リサイズする */
  private async resizeImage(buffer: Buffer, mimeType: string): Promise<Result<Buffer>> {
    try {
      if(mimeType === 'image/gif') return { result: buffer };  // sharp を通すとアニメーション GIF が動かなくなるので GIF は変換しないことにする
      return { result: await sharp(buffer).resize(null, commonEmojisConstants.maxImageHeightPx, { fit: 'inside' }).toBuffer() };
    }
    catch(error) {
      this.logger.error('画像ファイルのリサイズに失敗', error);
      return { error: '画像ファイルのリサイズに失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
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
      await this.nestMinioService.getMinio().putObject(commonEmojisConstants.bucketName, fileName, buffer, buffer.byteLength, { 'Content-Type': mimeType });
      return { result: `/${commonEmojisConstants.bucketName}/${fileName}` };
    }
    catch(error) {
      this.logger.error('絵文字リアクション画像のアップロードに失敗', error);
      return { error: '絵文字リアクション画像のアップロードに失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
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
