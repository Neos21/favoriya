import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FavouriteEntity } from '../../../../shared/entities/favourite.entity';
import { NotificationEntity } from '../../../../shared/entities/notification.entity';
import { PostEntity } from '../../../../shared/entities/post.entity';
import { NotificationsService } from '../../../notifications/notifications.service';

import type { Result } from '../../../../common/types/result';

/** Favourites Service */
@Injectable()
export class FavouritesService {
  private readonly logger: Logger = new Logger(FavouritesService.name);
  
  constructor(
    @InjectRepository(FavouriteEntity) private readonly favouritesRepository: Repository<FavouriteEntity>,
    @InjectRepository(PostEntity) private readonly postsRepository: Repository<PostEntity>,
    private readonly notificationsService: NotificationsService
  ) { }
  
  /** ふぁぼを付ける */
  public async create(favouritedPostsUserId: string, favouritedPostId: string, userId: string): Promise<Result<boolean>> {
    if(favouritedPostsUserId === userId) return { error: '自分自身の投稿にふぁぼは付けられません', code: HttpStatus.BAD_REQUEST };
    
    try {
      const postEntity = await this.postsRepository.findOneBy({ id: favouritedPostId, userId: favouritedPostsUserId });
      if(postEntity == null) return { error: 'ふぁぼ対象の投稿が見つかりません', code: HttpStatus.NOT_FOUND };
    }
    catch(error) {
      this.logger.error('ふぁぼ対象の投稿の取得に失敗', error);
      return { error: 'ふぁぼ対象の投稿の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    try {
      const newFavouriteEntity = new FavouriteEntity({
        favouritedPostsUserId,
        favouritedPostId,
        userId
      });
      await this.favouritesRepository.insert(newFavouriteEntity);
    }
    catch(error) {
      this.logger.error('ふぁぼ付け処理に失敗', error);
      return { error: 'ふぁぼ付け処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    const notificationEntity = new NotificationEntity({
      notificationType: 'favourite',
      message         : `@${userId} さんがあなたの投稿をふぁぼりました`,
      recipientUserId : favouritedPostsUserId,
      actorUserId     : userId,
      postId          : favouritedPostId
    });
    await this.notificationsService.create(notificationEntity);  // エラーは無視する
    
    return { result: true };
  }
  
  /** ふぁぼを外す */
  public async remove(favouritedPostsUserId: string, favouritedPostId: string, userId: string): Promise<Result<boolean>> {
    try {
      const postEntity = await this.postsRepository.findOneBy({ id: favouritedPostId, userId: favouritedPostsUserId });
      if(postEntity == null) return { error: 'ふぁぼ外し対象の投稿が見つかりません', code: HttpStatus.NOT_FOUND };
    }
    catch(error) {
      this.logger.error('ふぁぼ外し対象の投稿の取得に失敗', error);
      return { error: 'ふぁぼ外し対象の投稿の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    try {
      const deleteResult = await this.favouritesRepository.delete({ favouritedPostsUserId, favouritedPostId, userId });
      if(deleteResult.affected === 0) return { error: '削除対象のふぁぼは存在しませんでした', code: HttpStatus.NOT_FOUND };
      if(deleteResult.affected !== 1) {
        this.logger.error('ふぁぼの削除処理で2件以上の削除が発生', deleteResult);
        return { error: 'ふぁぼの削除処理で問題が発生', code: HttpStatus.INTERNAL_SERVER_ERROR };
      }
      return { result: true };
    }
    catch(error) {
      this.logger.error('ふぁぼ外し処理に失敗', error);
      return { error: 'ふぁぼ外し処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
