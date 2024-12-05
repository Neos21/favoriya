import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PostEntity } from '../../../shared/entities/post.entity';

import type { Post } from '../../../common/types/post';
import type { Result } from '../../../common/types/result';

/** Posts Service */
@Injectable()
export class PostsService {
  private readonly logger: Logger = new Logger(PostsService.name);
  
  constructor(@InjectRepository(PostEntity) private readonly postsRepository: Repository<PostEntity>) { }
  
  /** 投稿する */
  public async create(post: Post): Promise<Result<boolean>> {
    const newPostEntity = new PostEntity(post);
    try {
      await this.postsRepository.insert(newPostEntity);  // Throws
    }
    catch(error) {
      this.logger.error('投稿処理に失敗しました (DB エラー)', error);
      throw error;
    }
    
    return { result: true };
  }
}
