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
      const posts = await this.postsRepository.find({
        take: 50,
        order: { createdAt: 'DESC' }
      });
      
      const postsApi: Array<PostApi> = posts.map(post => camelToSnakeCaseObject(post));
      return { result: postsApi };
    }
    catch(error) {
      this.logger.error('グローバルタイムラインの取得に失敗しました (DB エラー)', error);
      return { error: 'グローバルタイムラインの取得に失敗しました' };
    }
  }
}
