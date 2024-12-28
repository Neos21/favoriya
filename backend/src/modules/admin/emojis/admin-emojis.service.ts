import { NestMinioService } from 'nestjs-minio';
import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { commonEmojisConstants } from '../../../common/constants/emojis-constants';
import { EmojiReactionEntity } from '../../../shared/entities/emoji-reaction.entity';
import { EmojiEntity } from '../../../shared/entities/emoji.entity';

import type { Result } from '../../../common/types/result';

/** Admin Emojis Service */
@Injectable()
export class AdminEmojisService {
  private readonly logger: Logger = new Logger(AdminEmojisService.name);
  
  constructor(
    @InjectRepository(EmojiEntity) private readonly emojisRepository: Repository<EmojiEntity>,
    @InjectRepository(EmojiReactionEntity) private readonly emojiReactionsRepository: Repository<EmojiReactionEntity>,
    private readonly nestMinioService: NestMinioService,
  ) { }
  
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
      const objectName = imageUrl.replace(`/${commonEmojisConstants.bucketName}/`, '');  // バケット名を除去しオブジェクト名を抽出する
      await this.nestMinioService.getMinio().removeObject(commonEmojisConstants.bucketName, objectName);
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
      
      // 指定 ID のリアクション絵文字を使ったリアクション情報を全て削除する (表示時にバグるため)
      const deleteReactionsResult = await this.emojiReactionsRepository.delete({ emojiId: id });
      this.logger.debug(`削除した絵文字を利用しているリアクションを ${deleteReactionsResult.affected} 件削除`);
      
      return { result: true };
    }
    catch(error) {
      this.logger.error('絵文字リアクション情報の削除に失敗', error);
      return { error: '絵文字リアクション情報の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
