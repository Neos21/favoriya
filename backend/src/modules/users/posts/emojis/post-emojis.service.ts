import { QueryFailedError, Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EmojiReactionEntity } from '../../../../shared/entities/emoji-reaction.entity';
import { NotificationEntity } from '../../../../shared/entities/notification.entity';
import { NotificationsService } from '../../../notifications/notifications.service';

import type { Result } from '../../../../common/types/result';

/** Post Emojis Service */
@Injectable()
export class PostEmojisService {
  private readonly logger: Logger = new Logger(PostEmojisService.name);
  
  constructor(
    @InjectRepository(EmojiReactionEntity) private readonly emojiReactionsRepository: Repository<EmojiReactionEntity>,
    private readonly notificationsService: NotificationsService
  ) { }
  
  /** 絵文字リアクションを付ける */
  public async create(reactedPostsUserId: string, reactedPostId: string, userId: string, emojiId: number): Promise<Result<EmojiReactionEntity>> {
    let createdEmojiReactionEntity;
    try {
      const newEmojiReactionEntity = new EmojiReactionEntity({ reactedPostsUserId, reactedPostId, userId, emojiId });
      createdEmojiReactionEntity = await this.emojiReactionsRepository.save(newEmojiReactionEntity);
    }
    catch(error) {
      if(error instanceof QueryFailedError && (error as unknown as { code: string }).code === '23505') return { error: 'その絵文字リアクションは既に登録されています', code: HttpStatus.BAD_REQUEST };
      this.logger.error('絵文字リアクション登録処理に失敗', error);
      return { error: '絵文字リアクション登録処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    if(reactedPostsUserId !== userId && !['anonymous', 'shumai'].includes(reactedPostsUserId)) {
      const notificationEntity = new NotificationEntity({
        notificationType: 'emoji',
        message         : `@${userId} さんがあなたの投稿に絵文字リアクションをしました`,
        recipientUserId : reactedPostsUserId,
        actorUserId     : userId,
        postId          : reactedPostId,
        emojiId         : emojiId
      });
      await this.notificationsService.create(notificationEntity);  // エラーは無視する
    }
    
    return { result: createdEmojiReactionEntity };  // フロントエンドで ID を使用しているのでコレを返す
  }
  
  /** 絵文字リアクションを外す */
  public async remove(reactedPostsUserId: string, reactedPostId: string, userId: string, id: number): Promise<Result<boolean>> {
    try {
      const deleteResult = await this.emojiReactionsRepository.delete({ id, reactedPostsUserId, reactedPostId, userId });
      if(deleteResult.affected === 0) return { error: '削除対象の絵文字リアクションは存在しませんでした', code: HttpStatus.NOT_FOUND };
      if(deleteResult.affected !== 1) {
        this.logger.error('絵文字リアクションの削除処理で2件以上の削除が発生', deleteResult);
        return { error: '絵文字リアクションの削除処理で問題が発生', code: HttpStatus.INTERNAL_SERVER_ERROR };
      }
      return { result: true };
    }
    catch(error) {
      this.logger.error('絵文字リアクションの削除処理に失敗', error);
      return { error: '絵文字リアクションの削除処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
