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
      const posts = await this.postsRepository
        .createQueryBuilder('posts')
        .select(['posts.id', 'posts.userId', 'posts.text', 'posts.favouritesCount', 'posts.createdAt'])  // 投稿内容
        .leftJoin('posts.user', 'users')  // 投稿に対応する users を結合する
        .addSelect(['users.name', 'users.avatarUrl'])  // 投稿ユーザの情報
        .leftJoin('posts.favourites', 'favourites')  // 投稿に対する favourites を結合する
        .addSelect(['favourites.id'])
        .leftJoin('favourites.favouritedByUser', 'favourited_by_users')  // ふぁぼったユーザ情報
        .addSelect(['favourited_by_users.id', 'favourited_by_users.avatarUrl'])
        .orderBy('posts.createdAt', 'DESC')  // created_at の降順
        .skip(offset)
        .take(limit)
        .getMany();
      return { result: posts };
    }
    catch(error) {
      this.logger.error('グローバルタイムラインの取得に失敗', error);
      return { error: 'グローバルタイムラインの取得に失敗' };
    }
  }
}
