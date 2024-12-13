import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FavouriteEntity } from '../../../../shared/entities/favourite.entity';
import { PostEntity } from '../../../../shared/entities/post.entity';

import type { Result } from '../../../../common/types/result';

/** Favourites Service */
@Injectable()
export class FavouritesService {
  private readonly logger: Logger = new Logger(FavouritesService.name);
  
  constructor(
    @InjectRepository(FavouriteEntity) private readonly favouritesRepository: Repository<FavouriteEntity>,
    @InjectRepository(PostEntity) private readonly postsRepository: Repository<PostEntity>
  ) { }
  
  /** ふぁぼを付ける */
  public async create(favouritedPostsUserId: string, favouritedPostId: string, userId: string): Promise<Result<boolean>> {
    if(favouritedPostsUserId === userId) return { error: '自分自身の投稿にふぁぼは付けられません', code: HttpStatus.BAD_REQUEST };
    
    let postEntity;
    try {
      postEntity = await this.postsRepository.findOneBy({ id: favouritedPostId, userId: favouritedPostsUserId });
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
    
    try {
      postEntity.favouritesCount += 1;  // インクリメントする
      const updateResult = await this.postsRepository.update(postEntity.id, postEntity);
      if(updateResult.affected !== 1) {  // 1件だけ更新が成功していない場合
        this.logger.error('ふぁぼ数の更新処理で0件 or 2件以上の更新が発生', updateResult);
        return { error: 'ふぁぼ数の更新処理でが発生', code: HttpStatus.INTERNAL_SERVER_ERROR };
      }
      return { result: true };
    }
    catch(error) {
      this.logger.error('ふぁぼ数の更新処理に失敗', error);
      return { error: 'ふぁぼ数の更新処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** ふぁぼを外す */
  public async remove(favouritedPostsUserId: string, favouritedPostId: string, userId: string): Promise<Result<boolean>> {
    let postEntity;
    try {
      postEntity = await this.postsRepository.findOneBy({ id: favouritedPostId, userId: favouritedPostsUserId });
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
    }
    catch(error) {
      this.logger.error('ふぁぼ外し処理に失敗', error);
      return { error: 'ふぁぼ外し処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    try {
      postEntity.favouritesCount -= 1;  // デクリメントする
      const updateResult = await this.postsRepository.update(postEntity.id, postEntity);
      if(updateResult.affected !== 1) {  // 1件だけ更新が成功していない場合
        this.logger.error('ふぁぼ数の更新処理で0件 or 2件以上の更新が発生', updateResult);
        return { error: 'ふぁぼ数の更新処理で問題が発生', code: HttpStatus.INTERNAL_SERVER_ERROR };
      }
      return { result: true };
    }
    catch(error) {
      this.logger.error('ふぁぼ数の更新処理に失敗', error);
      return { error: 'ふぁぼ数の更新処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
