import ffmpeg from 'fluent-ffmpeg';
import heicConvert from 'heic-convert';
import { NestMinioService } from 'nestjs-minio';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import sharp from 'sharp';
import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { commonPostsConstants } from '../../../common/constants/posts-constants';
import { AttachmentEntity } from '../../../shared/entities/attachment.entity';
import { PostEntity } from '../../../shared/entities/post.entity';

import type { Result } from '../../../common/types/result';

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
    if(!file.mimetype.startsWith('image/') && !['.heic', 'heif'].some(extName => file.originalname.toLocaleLowerCase().endsWith(extName)) && !file.mimetype.startsWith('audio/')) return { error: '画像または音声ファイルではありません', code: HttpStatus.BAD_REQUEST };
    
    let convertedBuffer: Buffer;
    let extName: string;
    let mimeType: string;
    if(file.mimetype.startsWith('image/') || ['.heic', 'heif'].some(extName => file.originalname.toLocaleLowerCase().endsWith(extName))) {
      const resizedBufferResult = await this.resizeImage(file.buffer, file.originalname, file.mimetype);
      if(resizedBufferResult.error != null) return resizedBufferResult as Result<string>;
      convertedBuffer = resizedBufferResult.result;
      extName  = file.mimetype === 'image/gif' ? '.gif'      : '.jpg';
      mimeType = file.mimetype === 'image/gif' ? 'image/gif' : 'image/jpeg';
    }
    else if(file.mimetype.startsWith('audio/')) {
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
      if(['image/heic', 'image/heif'].includes(mimeType) || ['.heic', 'heif'].some(extName => fileName.toLocaleLowerCase().endsWith(extName))) {
        this.logger.debug('HEIC or HEIF を変換');
        convertedBuffer = await heicConvert({
          buffer: buffer,
          format: 'JPEG',
          quality: .9
        });
      }
      const resizedBuffer = await sharp(convertedBuffer)
        .jpeg({ quality: 85 })
        .resize({ width: commonPostsConstants.maxImagePx, height: commonPostsConstants.maxImagePx, fit: 'outside', withoutEnlargement: true })  // 長辺を指定ピクセルにリサイズする・それ以下のサイズの場合は拡大はしない
        .toBuffer();
      return { result: resizedBuffer };
    }
    catch(error) {
      this.logger.error('画像ファイルの変換・リサイズに失敗', error);
      return { error: '画像ファイルの変換・リサイズに失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
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
