import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { selectColumns } from '../../../shared/constants/find-posts';
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
    try {
      const newPostEntity = new PostEntity({
        userId: post.userId,
        text  : post.text
      });
      await this.postsRepository.insert(newPostEntity);
      return { result: true };
    }
    catch(error) {
      this.logger.error('投稿処理に失敗 (DB エラー)', error);
      return { error: '投稿処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 投稿一覧を取得する */
  public async findById(userId: string): Promise<Result<Array<PostEntity>>> {
    try {
      const posts = await this.postsRepository
        .createQueryBuilder('posts')
        .leftJoinAndSelect('posts.user', 'users')  // 投稿に対応する users を結合する
        .leftJoinAndSelect('posts.favourites', 'favourites')  // 投稿に対する favourites を結合する
        .select(selectColumns)  // 必要なカラムを選択する
        .where('posts.userId = :userId', { userId })  // 指定のユーザ ID
        .orderBy('posts.createdAt', 'DESC')  // created_at の降順
        .limit(50)  // 上限50件
        .getMany();
      return { result: posts };
    }
    catch(error) {
      this.logger.error('投稿一覧の取得に失敗 (DB エラー)', error);
      return { error: '投稿一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 投稿1件を取得する */
  public async findOneById(userId: string, postId: string): Promise<Result<PostEntity>> {
    try {
      const post = await this.postsRepository
        .createQueryBuilder('posts')
        .leftJoinAndSelect('posts.user', 'users')  // 投稿に対応する users を結合する
        .leftJoinAndSelect('posts.favourites', 'favourites')  // 投稿に対する favourites を結合する
        .select(selectColumns)  // 必要なカラムを選択する
        .where('posts.userId = :userId AND posts.id = :postId', { userId, postId })  // 指定のユーザ ID・投稿 ID
        .getOne();
      if(post == null) return { error: '指定の投稿は存在しません', code: HttpStatus.NOT_FOUND };
      return { result: post };
    }
    catch(error) {
      this.logger.error('投稿の取得に失敗 (DB エラー)', error);
      return { error: '投稿の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 投稿1件を削除する */
  public async removeOneById(userId: string, postId: string): Promise<Result<boolean>> {
    try {
      const deleteResult = await this.postsRepository.delete({ id: postId, userId });
      if(deleteResult.affected === 0) return { error: '削除対象の投稿は存在しませんでした', code: HttpStatus.NOT_FOUND };
      if(deleteResult.affected !== 1) {
        this.logger.error('投稿の削除処理で2件以上の削除が発生', deleteResult);
        return { error: '投稿の削除処理で問題が発生', code: HttpStatus.INTERNAL_SERVER_ERROR };
      }
      return { result: true };
    }
    catch(error) {
      this.logger.error('投稿の削除に失敗 (DB エラー)', error);
      return { error: '投稿の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** ユーザに紐付く投稿を全削除する */
  public async removeAllByUserId(userId: string): Promise<Result<boolean>> {
    try {
      await this.postsRepository.delete({ userId });
      return { result: true };
    }
    catch(error) {
      this.logger.error('当該ユーザの全投稿の削除に失敗 (DB エラー)', error);
      return { error: '当該ユーザの全投稿の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
