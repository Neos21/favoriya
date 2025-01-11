import { CanvasRenderingContext2D, createCanvas, registerFont } from 'canvas';
import DOMPurify from 'dompurify';
import exifReader from 'exif-reader';
import ffmpeg from 'fluent-ffmpeg';
import heicConvert from 'heic-convert';
import { JSDOM } from 'jsdom';
import { NestMinioService } from 'nestjs-minio';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import sharp from 'sharp';
import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { commonPostsConstants } from '../../../common/constants/posts-constants';
import { commonTopicsConstants } from '../../../common/constants/topics-constants';
import { AttachmentEntity } from '../../../shared/entities/attachment.entity';
import { PostEntity } from '../../../shared/entities/post.entity';

import type { Result } from '../../../common/types/result';

// フォントを登録する
registerFont(path.resolve(__dirname, '../../../../assets/huifont29.ttf'), { family: 'HuiFont' });

/** Post Attachments Service */
@Injectable()
export class PostAttachmentsService {
  private readonly logger: Logger = new Logger(PostAttachmentsService.name);
  
  constructor(
    @InjectRepository(AttachmentEntity) private readonly attachmentsRepository: Repository<AttachmentEntity>,
    private readonly nestMinioService: NestMinioService
  ) { }
  
  /** バケットがなければ作成する */
  public async onModuleInit(): Promise<void> {
    try {
      const existsBucket = await this.nestMinioService.getMinio().bucketExists(commonPostsConstants.bucketName);
      if(existsBucket) {
        this.logger.debug('添付ファイル用のバケット作成済');
      }
      else {
        this.logger.debug('添付ファイル用のバケット未作成・作成開始');
        await this.nestMinioService.getMinio().makeBucket(commonPostsConstants.bucketName);
        this.logger.debug('添付ファイル用のバケット作成完了');
      }
    }
    catch(error) {
      this.logger.error('添付ファイル用のバケットの確認・作成に失敗', error);
    }
  }
  
  /** ファイルをアップロードし DB 登録する */
  public async save(file: Express.Multer.File, createdPostEntity: PostEntity): Promise<Result<string>> {
    if(file.size > (commonPostsConstants.maxFileSizeKb * 1024)) return { error: `ファイルサイズが ${commonPostsConstants.maxFileSizeMb} MB を超えています`, code: HttpStatus.BAD_REQUEST };
    if(!file.mimetype.startsWith('image/') && !['.heic', 'heif'].some(extName => file.originalname.toLowerCase().endsWith(extName)) &&
       !file.mimetype.startsWith('audio/') && !file.originalname.toLowerCase().endsWith('.m4a')
      ) return { error: '画像または音声ファイルではありません', code: HttpStatus.BAD_REQUEST };
    
    let convertedBuffer: Buffer;
    let extName: string;
    let mimeType: string;
    if(file.mimetype.startsWith('image/') || ['.heic', 'heif'].some(extName => file.originalname.toLowerCase().endsWith(extName))) {
      if(createdPostEntity.topicId === commonTopicsConstants.movaPic.id) {
        const resizedBufferResult = await this.movaPicImage(file.buffer, file.originalname, file.mimetype, createdPostEntity.text);
        if(resizedBufferResult.error != null) return resizedBufferResult as Result<string>;
        convertedBuffer = resizedBufferResult.result;
        extName  = '.jpg';
        mimeType = 'image/jpeg';
      }
      else {
        // 通常時
        const resizedBufferResult = await this.resizeImage(file.buffer, file.originalname, file.mimetype);
        if(resizedBufferResult.error != null) return resizedBufferResult as Result<string>;
        convertedBuffer = resizedBufferResult.result;
        extName  = file.mimetype === 'image/gif' ? '.gif'      : '.jpg';
        mimeType = file.mimetype === 'image/gif' ? 'image/gif' : 'image/jpeg';
      }
    }
    else if(file.mimetype.startsWith('audio/') || file.originalname.toLowerCase().endsWith('.m4a')) {
      const convertedBufferResult = await this.convertAudio(file.buffer);
      if(convertedBufferResult.error != null) return convertedBufferResult as Result<string>;
      convertedBuffer = convertedBufferResult.result;
      extName  = '.mp3';
      mimeType = 'audio/mp3';
    }
    else {
      return { error: '不正なファイル形式です', code: HttpStatus.BAD_REQUEST };
    }
    
    const fileName = `${createdPostEntity.userId}-${createdPostEntity.id}-00${extName}`;
    const filePathResult = await this.putObject(convertedBuffer, mimeType, fileName);
    if(filePathResult.error != null) return filePathResult;
    const result = await this.saveAttachment(createdPostEntity.userId, createdPostEntity.id, filePathResult.result, mimeType);
    if(result.error != null) return result as Result<string>;
    return filePathResult;  // 登録したファイルパスを返しておく
  }
  
  /** ファイルを削除し DB 削除する */
  public async remove(userId: string, postId: string): Promise<Result<boolean>> {
    const attachmentEntitiesResult = await this.findAllByPostId(userId, postId);
    if(attachmentEntitiesResult.error != null) return attachmentEntitiesResult as Result<boolean>;
    for(const attachmentEntity of attachmentEntitiesResult.result) {
      const removeObjectResult = await this.removeObject(attachmentEntity.filePath);
      if(removeObjectResult.error != null) return removeObjectResult;
      const removeAttachmentResult = await this.removeAttachment(attachmentEntity.id);
      if(removeAttachmentResult.error != null) return removeAttachmentResult;
    }
    return { result: true };
  }
  
  /** ユーザに紐付く添付ファイルを全て削除する */
  public async removeAllByUserId(userId: string): Promise<Result<boolean>> {
    const attachmentEntitiesResult = await this.findAllByUserId(userId);
    if(attachmentEntitiesResult.error != null) return attachmentEntitiesResult as Result<boolean>;
    for(const attachmentEntity of attachmentEntitiesResult.result) {
      const removeObjectResult = await this.removeObject(attachmentEntity.filePath);
      if(removeObjectResult.error != null) return removeObjectResult;
      const removeAttachmentResult = await this.removeAttachment(attachmentEntity.id);
      if(removeAttachmentResult.error != null) return removeAttachmentResult;
    }
    return { result: true };
  }
  
  private async resizeImage(buffer: Buffer, fileName: string, mimeType: string): Promise<Result<Buffer>> {
    // GIF はアニメーションの場合があるので変換しない
    if(mimeType === 'image/gif') return { result: buffer };
    
    try {
      let convertedBuffer: Buffer | ArrayBuffer = buffer;
      if(['image/heic', 'image/heif'].includes(mimeType) || ['.heic', 'heif'].some(extName => fileName.toLowerCase().endsWith(extName))) {
        this.logger.debug('HEIC or HEIF を変換');
        convertedBuffer = await heicConvert({
          buffer: buffer,
          format: 'JPEG',
          quality: .9
        });
      }
      const metadata = await sharp(convertedBuffer).metadata();
      const exif = metadata.exif ? exifReader(metadata.exif) : null;
      const orientation = exif?.Image?.Orientation ?? 1;
      // Orientation に基づいて画像を回転する
      let rotatedImage = sharp(convertedBuffer);
      switch(orientation) {
        case 3:  // 180度回転
          console.log('180');
          rotatedImage = rotatedImage.rotate(180);
          break;
        case 6:  // 時計回りに90度回転
          console.log('+90');
          rotatedImage = rotatedImage.rotate(90);
          break;
        case 8:  // 反時計回りに90度回転
          console.log('-90');
          rotatedImage = rotatedImage.rotate(270);
          break;
        default:  // 回転不要
          console.log('000');
          break;
      }
      
      const resizedBuffer = await rotatedImage
        .jpeg({ quality: 85 })
        .resize({ width: commonPostsConstants.maxImagePx, height: commonPostsConstants.maxImagePx, fit: 'inside', withoutEnlargement: true })  // 長辺を指定ピクセルにリサイズする・それ以下のサイズの場合は拡大はしない
        .toBuffer();
      return { result: resizedBuffer };
    }
    catch(error) {
      this.logger.error('画像ファイルの変換・リサイズに失敗', error);
      return { error: '画像ファイルの変換・リサイズに失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  private async movaPicImage(buffer: Buffer, fileName: string, mimeType: string, rawText: string): Promise<Result<Buffer>> {
    try {
      const text = DOMPurify(new JSDOM('').window).sanitize(rawText, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
      
      let convertedBuffer: Buffer | ArrayBuffer = buffer;
      if(['image/heic', 'image/heif'].includes(mimeType) || ['.heic', 'heif'].some(extName => fileName.toLowerCase().endsWith(extName))) {
        this.logger.debug('HEIC or HEIF を変換');
        convertedBuffer = await heicConvert({
          buffer: buffer,
          format: 'JPEG',
          quality: .9
        });
      }
      const originalMetadata = await sharp(convertedBuffer).metadata();
      const exif = originalMetadata.exif ? exifReader(originalMetadata.exif) : null;
      const orientation = exif?.Image?.Orientation ?? 1;
      // Orientation に基づいて画像を回転する
      let rotatedImage = sharp(convertedBuffer);
      switch(orientation) {
        case 3:  // 180度回転
          console.log('180');
          rotatedImage = rotatedImage.rotate(180);
          break;
        case 6:  // 時計回りに90度回転
          console.log('+90');
          rotatedImage = rotatedImage.rotate(90);
          break;
        case 8:  // 反時計回りに90度回転
          console.log('-90');
          rotatedImage = rotatedImage.rotate(270);
          break;
        default:  // 回転不要
          console.log('000');
          break;
      }
      
      const resizedBuffer = await rotatedImage
        .jpeg({ quality: 85 })
        .resize({ width: commonPostsConstants.maxImagePx, height: commonPostsConstants.maxImagePx, fit: 'inside', withoutEnlargement: true })  // 長辺を指定ピクセルにリサイズする・それ以下のサイズの場合は拡大はしない
        .toBuffer();
      
      const metadata = await sharp(resizedBuffer).metadata();
      const width  = metadata.width!;
      const height = metadata.height!;
      
      // Canvas を作成する
      const canvas = createCanvas(width, height);
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, width, height);  // 背景を透明にする
      // フォントとテキストを設定する
      const fontSize = 80;  // フォントサイズ・兼・行間の高さ
      context.font         = `bold ${fontSize}px HuiFont`;  // 登録したフォントを指定する
      context.fillStyle    = '#ffffff';  // テキストの色
      context.lineWidth    = 3;          // フチの太さ
      context.strokeStyle  = '#000000';  // フチの色
      context.textAlign    = 'start';    // テキストの位置
      context.textBaseline = 'top';      // ベースライン
      // テキストを描画する
      const maxWidth = width - 4;  // マージンを引いた幅
      const x = 2;  // 左端からの位置
      const y = 2;  // 上端からの位置
      const lines = this.wrapText(context, text, maxWidth);
      // テキストを行ごとに描画する (ハミ出してもエラーにはならない・縦のハミ出しは無視する)
      lines.forEach((line, index) => {
        context.strokeText(line, x, y + index * fontSize);
        context.fillText  (line, x, y + index * fontSize);
      });
      // canvas の内容をバッファに変換する
      const textBuffer = canvas.toBuffer('image/png');
      
      const movaPicBuffer = await sharp(resizedBuffer)
        .composite([{
          input: textBuffer,
          top  : 0,
          left : 0
        }])
        .jpeg({ quality: 85 })
        .toBuffer();
      return { result: movaPicBuffer };
    }
    catch(error) {
      this.logger.error('画像ファイルの携帯百景変換に失敗', error);
      return { error: '画像ファイルの携帯百景変換に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  private wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): Array<string> {
    const characters = [...text];  // 文字ごとに分割する
    const lines = [];
    let currentLine = characters[0];
    for(let i = 1; i < characters.length; i++) {
      const character = characters[i];
      const testLine = currentLine + character;
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if(testWidth > maxWidth) {
        lines.push(currentLine);  // 現在の行を確定する
        currentLine = character;  // 新しい行を開始する
      }
      else {
        currentLine = testLine;  // 行に文字を追加する
      }
    }
    lines.push(currentLine);  // 最後の行を追加する
    return lines;
  };
  
  private async convertAudio(buffer: Buffer): Promise<Result<Buffer>> {
    const tempInputFilePath  = path.join(__dirname, `temp-${Date.now()}.input`);
    const tempOutputFilePath = path.join(__dirname, `temp-${Date.now()}.output.mp3`);
    try {
      await fs.writeFile(tempInputFilePath, buffer);  // 一時ファイルに Buffer を書き込む
      // FFmpeg で変換する
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInputFilePath)
          .audioBitrate(128) // ビットレート (kbps) を指定する
          .toFormat('mp3')
          .on('end', () => resolve())
          .on('error', error => reject(error))
          .save(tempOutputFilePath);
      });
      // 変換されたファイルを Buffer として読み込む
      const convertedBuffer = await fs.readFile(tempOutputFilePath);
      return { result: convertedBuffer };
    }
    catch(error) {
      this.logger.error('音声ファイルの変換に失敗', error);
      return { error: '音声ファイルの変換に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    finally {
      if(await fs.stat(tempInputFilePath ).then(() => true).catch(() => false)) await fs.unlink(tempInputFilePath);
      if(await fs.stat(tempOutputFilePath).then(() => true).catch(() => false)) await fs.unlink(tempOutputFilePath);
    }
  }
  
  private async putObject(buffer: Buffer, mimeType: string, fileName: string): Promise<Result<string>> {
    try {
      await this.nestMinioService.getMinio().putObject(commonPostsConstants.bucketName, fileName, buffer, buffer.byteLength, { 'Content-Type': mimeType });
      return { result: `/${commonPostsConstants.bucketName}/${fileName}` };
    }
    catch(error) {
      this.logger.error('ファイルのアップロードに失敗', error);
      return { error: 'ファイルのアップロードに失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  private async saveAttachment(userId: string, postId: string, filePath: string, mimeType: string): Promise<Result<boolean>> {
    try {
      const attachmentEntity = new AttachmentEntity({ userId, postId, filePath, mimeType });
      await this.attachmentsRepository.insert(attachmentEntity);
      return { result: true };
    }
    catch(error) {
      this.logger.error('添付ファイル情報の登録に失敗', error);
      return { error: '添付ファイル情報の登録に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  private async findAllByPostId(userId: string, postId: string): Promise<Result<Array<AttachmentEntity>>> {
    try {
      const attachmentEntities = await this.attachmentsRepository.findBy({ userId, postId });
      return { result: attachmentEntities };
    }
    catch(error) {
      this.logger.error('添付ファイル情報の取得に失敗', error);
      return { error: '添付ファイル情報の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  private async removeObject(filePath: string): Promise<Result<boolean>> {
    try {
      const objectName = filePath.replace(`/${commonPostsConstants.bucketName}/`, '');  // バケット名を除去しオブジェクト名を抽出する
      await this.nestMinioService.getMinio().removeObject(commonPostsConstants.bucketName, objectName);
      return { result: true };
    }
    catch(error) {
      this.logger.error('添付ファイルの削除に失敗', error);
      return { error: '添付ファイルの削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  private async removeAttachment(id: number): Promise<Result<boolean>> {
    try {
      const deleteResult = await this.attachmentsRepository.delete({ id });
      if(deleteResult.affected !== 1) return { error: '指定 ID の添付ファイル情報の削除中に問題が発生', code: HttpStatus.INTERNAL_SERVER_ERROR };
      return { result: true };
    }
    catch(error) {
      this.logger.error('添付ファイル情報の削除に失敗', error);
      return { error: '添付ファイル情報の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  private async findAllByUserId(userId: string): Promise<Result<Array<AttachmentEntity>>> {
    try {
      const attachmentEntities = await this.attachmentsRepository.findBy({ userId });
      return { result: attachmentEntities };
    }
    catch(error) {
      this.logger.error('ユーザに紐付く全添付ファイル情報の取得に失敗', error);
      return { error: 'ユーザに紐付く全添付ファイル情報の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
