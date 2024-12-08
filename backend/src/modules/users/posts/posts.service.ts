import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PostEntity } from '../../../shared/entities/post.entity';

import type { Post } from '../../../common/types/post';
import type { Result } from '../../../common/types/result';

/** Posts Service */
@Injectable()
export class PostsService {
  public readonly postNotFoundErrorMessage: string = '指定の投稿は存在しません';
  
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
        .select(['posts.id', 'posts.userId', 'posts.text', 'posts.createdAt', 'users.name', 'users.avatarUrl'])  // 必要なカラムを選択する
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
  
  /** 投稿1件を取得する */
  public async findOneById(userId: string, postId): Promise<Result<PostEntity>> {
    try {
      const post = await this.postsRepository
        .createQueryBuilder('posts')
        .leftJoinAndSelect('posts.user', 'users')  // users を結合する
        .select(['posts.id', 'posts.userId', 'posts.text', 'posts.createdAt', 'users.name', 'users.avatarUrl'])  // 必要なカラムを選択する
        .where('posts.userId = :userId AND posts.id = :postId', { userId, postId })  // 指定のユーザ ID・投稿 ID
        .getOne();
      if(post == null) return { error: this.postNotFoundErrorMessage };
      return { result: post };
    }
    catch(error) {
      this.logger.error('投稿の取得に失敗しました (DB エラー)', error);
      return { error: '投稿の取得に失敗しました' };
    }
  }
  
  /** 投稿1件を削除する */
  public async removeOneById(userId: string, postId: string): Promise<Result<boolean>> {
    try {
      const deleteResult = await this.postsRepository.delete({ id: postId, userId });
      if(deleteResult.affected === 0) return { error: this.postNotFoundErrorMessage };
      if(deleteResult.affected !== 1) {
        this.logger.error('投稿の削除処理で2件以上の削除が発生', deleteResult);
        throw new Error('Invalid Affected');
      }
      return { result: true };
    }
    catch(error) {
      this.logger.error('投稿の削除に失敗しました (DB エラー)', error);
      return { error: '投稿の削除に失敗しました' };
    }
  }
}
