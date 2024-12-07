import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { camelToSnakeCaseObject } from '../../common/helpers/convert-case';
import { PostEntity } from '../../shared/entities/post.entity';

import type { Result } from '../../common/types/result';
import type { PostApi } from '../../common/types/post';

/** Timeline Service */
@Injectable()
export class TimelineService {
  private readonly logger: Logger = new Logger(TimelineService.name);
  
  constructor(@InjectRepository(PostEntity) private readonly postsRepository: Repository<PostEntity>) { }
  
  /** グローバルタイムラインを取得する */
  public async getGlobalTimeline(): Promise<Result<Array<PostApi>>> {
    try {
      const posts = await this.postsRepository
        .createQueryBuilder('posts')
        .leftJoinAndSelect('posts.user', 'users')  // users を結合する
        .select(['posts.id', 'posts.userId', 'posts.text', 'posts.createdAt', 'users.name'])  // 必要なカラムを選択する
        .orderBy('posts.createdAt', 'DESC')  // created_at の降順
        .limit(50)  // 上限50件
        .getMany();
      
      const postsApi: Array<PostApi> = posts.map(post => camelToSnakeCaseObject(post));
      return { result: postsApi };
    }
    catch(error) {
      this.logger.error('グローバルタイムラインの取得に失敗しました (DB エラー)', error);
      return { error: 'グローバルタイムラインの取得に失敗しました' };
    }
  }
}