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
    const newPostEntity = new PostEntity({
      userId: post.userId,
      text: post.text
    });
    
    try {
      await this.postsRepository.insert(newPostEntity);
    }
    catch(error) {
      this.logger.error('投稿処理に失敗しました (DB エラー)', error);
      return { error: '投稿処理に失敗しました' };
    }
    
    return { result: true };
  }
  
  /** 投稿一覧を取得する */
  public async findById(userId: string): Promise<Result<Array<PostEntity>>> {
    try {
      const posts = await this.postsRepository
        .createQueryBuilder('posts')
        .leftJoinAndSelect('posts.user', 'users')  // users を結合する
        .select(['posts.id', 'posts.userId', 'posts.text', 'posts.createdAt', 'users.name'])  // 必要なカラムを選択する
        .where('posts.userId = :userId', { userId })  // 指定のユーザ ID
        .orderBy('posts.createdAt', 'DESC')  // created_at の降順
        .limit(50)  // 上限50件
        .getMany();
      return { result: posts };
    }
    catch(error) {
      this.logger.error('投稿一覧の取得に失敗しました (DB エラー)', error);
      return { error: '投稿一覧の取得に失敗しました' };
    }
  }
}
