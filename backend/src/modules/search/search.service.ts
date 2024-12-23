import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PostEntity } from '../../shared/entities/post.entity';

import type { Result } from '../../common/types/result';

/** Search Service */
@Injectable()
export class SearchService {
  private readonly logger: Logger = new Logger(SearchService.name);
  
  constructor(@InjectRepository(PostEntity) private readonly postsRepository: Repository<PostEntity>) { }
  
  /** 検索する */
  public async search(query: string, offset: number = 0, limit: number = 100): Promise<Result<Array<PostEntity>>> {
    try {
      const posts = await this.postsRepository
        .createQueryBuilder('posts')
        .select(['posts.id', 'posts.userId', 'posts.text', 'posts.topicId', 'posts.createdAt'])  // 投稿内容
        .leftJoin('posts.user', 'users')  // 投稿に対応する users を結合する
        .addSelect(['users.name', 'users.avatarUrl'])  // 投稿ユーザの情報
        .leftJoin('posts.favourites', 'favourites')  // 投稿に対する favourites を結合する
        .addSelect(['favourites.id'])
        .leftJoin('favourites.favouritedByUser', 'favourited_by_users')  // ふぁぼったユーザ情報
        .addSelect(['favourited_by_users.id', 'favourited_by_users.avatarUrl'])
        .where('posts.text ILIKE :query', { query: `%${query}%` })  // 本文の部分一致検索 (PostgreSQL の ILIKE で大文字小文字を区別しない)
        .orderBy('posts.createdAt', 'DESC')  // created_at の降順
        .skip(offset)
        .take(limit)
        .getMany();
      return { result: posts };
    }
    catch(error) {
      this.logger.error('検索結果の取得に失敗', error);
      return { error: '検索結果の取得に失敗' };
    }
  }
  
}
