import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PostEntity } from '../../shared/entities/post.entity';

import type { Result } from '../../common/types/result';

/** Timeline Service */
@Injectable()
export class TimelineService {
  private readonly logger: Logger = new Logger(TimelineService.name);
  
  constructor(@InjectRepository(PostEntity) private readonly postsRepository: Repository<PostEntity>) { }
  
  /** グローバルタイムラインを取得する */
  public async getGlobalTimeline(offset: number = 0, limit: number = 100): Promise<Result<Array<PostEntity>>> {
    try {
      const rawPosts = await this.postsRepository
        .createQueryBuilder('posts')
        .select(['posts.id', 'posts.userId', 'posts.text', 'posts.favouritesCount', 'posts.createdAt'])  // 投稿内容
        .leftJoinAndSelect('posts.user', 'users')  // 投稿に対応する users を結合する
        .addSelect(['users.name', 'users.avatarUrl'])  // 投稿ユーザの情報
        .leftJoinAndSelect('posts.favourites', 'favourites')  // 投稿に対する favourites を結合する
        .addSelect(['favourites.id'])
        .leftJoinAndSelect('favourites.favouritedToUser', 'favourited_to_users')  // ふぁぼられたユーザ情報
        .addSelect(['favourited_to_users.id', 'favourited_to_users.avatarUrl'])
        .leftJoinAndSelect('favourites.favouritedByUser', 'favourited_by_users')  // ふぁぼったユーザ情報
        .addSelect(['favourited_by_users.id', 'favourited_by_users.avatarUrl'])
        .orderBy('posts.createdAt', 'DESC')  // created_at の降順
        .skip(offset)
        .take(limit)
        .getMany();
      // どうしても余計な情報を取得してしまうので削る
      const posts = rawPosts.map(rawPost => {
        delete rawPost.user.passwordHash;
        delete rawPost.user.role;
        delete rawPost.user.showOwnFavouritesCount;
        delete rawPost.user.showOthersFavouritesCount;
        rawPost.favourites = rawPost.favourites.map(favourite => {
          delete favourite.favouritedByUser.passwordHash;
          delete favourite.favouritedByUser.role;
          delete favourite.favouritedByUser.showOwnFavouritesCount;
          delete favourite.favouritedByUser.showOthersFavouritesCount;
          return favourite;
        });
        return rawPost;
      });
      return { result: posts };
    }
    catch(error) {
      this.logger.error('グローバルタイムラインの取得に失敗 (DB エラー)', error);
      return { error: 'グローバルタイムラインの取得に失敗' };
    }
  }
}
