import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { selectColumns } from '../../shared/constants/find-posts';
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
        .leftJoinAndSelect('posts.user', 'users')  // 投稿に対応する users を結合する
        .leftJoinAndSelect('posts.favourites', 'favourites')  // 投稿に対する favourites を結合する
        .leftJoinAndMapOne('favourites.user', 'users', 'favourited_users', 'favourites.userId = favourited_users.id')  // ふぁぼられの users を結合する
        .select(selectColumns)  // 必要なカラムを選択する
        .orderBy('posts.createdAt', 'DESC')  // created_at の降順
        .skip(offset)
        .take(limit)
        .getMany();
      return { result: posts };
    }
    catch(error) {
      this.logger.error('グローバルタイムラインの取得に失敗 (DB エラー)', error);
      return { error: 'グローバルタイムラインの取得に失敗' };
    }
  }
}
