import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PostEntity } from '../../shared/entities/post.entity';
import { postsQueryBuilder } from '../../shared/helpers/posts-query-builder';

import type { Result } from '../../common/types/result';

/** Timeline Service */
@Injectable()
export class TimelineService {
  private readonly logger: Logger = new Logger(TimelineService.name);
  
  constructor(@InjectRepository(PostEntity) private readonly postsRepository: Repository<PostEntity>) { }
  
  /** グローバルタイムラインを取得する */
  public async getGlobalTimeline(offset: number = 0, limit: number = 100): Promise<Result<Array<PostEntity>>> {
    try {
      const posts = await postsQueryBuilder(this.postsRepository)
        .where('posts.visibility IS NULL')  // visibility に何か入っている場合は表示しない
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
  
  /** ホームタイムラインを取得する */
  public async getHomeTimeline(userId: string, offset: number = 0, limit: number = 100): Promise<Result<Array<PostEntity>>> {
    try {
      const posts = await postsQueryBuilder(this.postsRepository)
        .leftJoin('follows', 'follows', 'follows.followerUserId = posts.userId AND follows.followingUserId = :userId', { userId })  // ログインユーザがフォローしている人を条件にする
        .where('follows.followerUserId IS NOT NULL OR posts.userId = :userId', { userId })  // ログインユーザ自身の投稿も含める
        .orderBy('posts.createdAt', 'DESC')  // created_at の降順
        .skip(offset)
        .take(limit)
        .getMany();
      return { result: posts };
    }
    catch(error) {
      this.logger.error('ホームタイムラインの取得に失敗', error);
      return { error: 'ホームタイムラインの取得に失敗' };
    }
  }
}
