import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { topicsConstants } from '../../../common/constants/topics-constants';
import { PollEntity } from '../../../shared/entities/poll.entity';
import { PollOptionEntity } from '../../../shared/entities/poll-option.entity';
import { PostEntity } from '../../../shared/entities/post.entity';
import { postsQueryBuilder } from '../../../shared/helpers/posts-query-builder';

import type { Post } from '../../../common/types/post';
import type { Result } from '../../../common/types/result';

/** Posts Service */
@Injectable()
export class PostsService {
  private readonly logger: Logger = new Logger(PostsService.name);
  
  constructor(
    @InjectRepository(PostEntity) private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(PollEntity) private readonly pollsRepository: Repository<PollEntity>,
    @InjectRepository(PollOptionEntity) private readonly pollOptionsRepository: Repository<PollOptionEntity>
  ) { }
  
  /** 投稿する */
  public async create(post: Post): Promise<Result<boolean>> {
    try {
      const newPostEntity = new PostEntity({
        userId         : post.topicId === topicsConstants.anonymous.id ? 'anonymous' : post.userId,
        text           : post.text,
        topicId        : post.topicId,
        visibility     : post.visibility,
        inReplyToPostId: post.inReplyToPostId,
        inReplyToUserId: post.inReplyToUserId,
        hasPoll        : post.topicId === topicsConstants.poll.id
      });
      const createdPostEntity = await this.postsRepository.save(newPostEntity);
      
      // アンケートモード
      if(post.topicId === topicsConstants.poll.id) {
        const result = await this.createPoll(post, createdPostEntity);
        if(result.error != null) return result;
      }
      
      return { result: true };
    }
    catch(error) {
      this.logger.error('投稿処理に失敗', error);
      return { error: '投稿処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 指定ユーザの投稿一覧を取得する */
  public async findById(userId: string, offset: number = 0, limit: number = 50): Promise<Result<Array<PostEntity>>> {
    try {
      const posts = await postsQueryBuilder(this.postsRepository)
        .where('posts.userId = :userId', { userId })  // 指定のユーザ ID
        .orderBy('posts.createdAt', 'DESC')  // created_at の降順
        .skip(offset)
        .take(limit)
        .getMany();
      return { result: posts };
    }
    catch(error) {
      this.logger.error('投稿一覧の取得に失敗', error);
      return { error: '投稿一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 指定ユーザの投稿1件を取得する */
  public async findOneById(userId: string, postId: string): Promise<Result<PostEntity>> {
    try {
      const post = await postsQueryBuilder(this.postsRepository)
        .where('posts.userId = :userId AND posts.id = :postId', { userId, postId })  // 指定のユーザ ID・投稿 ID
        .getOne();
      if(post == null) return { error: '指定の投稿は存在しません', code: HttpStatus.NOT_FOUND };
      return { result: post };
    }
    catch(error) {
      this.logger.error('投稿の取得に失敗', error);
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
      this.logger.error('投稿の削除に失敗', error);
      return { error: '投稿の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** アンケートモードの時に選択肢を登録する */
  private async createPoll(post: Post, createdPostEntity: PostEntity): Promise<Result<boolean>> {
    try {
      const newPollEntity = new PollEntity({
        userId   : post.userId,
        postId   : createdPostEntity.id,
        expiresAt: this.createExpiresAt(post.poll.expiresAt as string)
      });
      const createdPollEntity = await this.pollsRepository.save(newPollEntity);
      
      for(const pollOption of post.poll.pollOptions) {
        const newPollOptionEntity = new PollOptionEntity({
          pollId: createdPollEntity.id,
          text  : pollOption.text
        });
        await this.pollOptionsRepository.insert(newPollOptionEntity);
      }
      
      return { result: true };
    }
    catch(error) {
      this.logger.error('アンケートの登録処理に失敗', error);
      return { error: 'アンケートの登録処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  private createExpiresAt(expiresAt: string): Date {
    const now = new Date();
    if(expiresAt === '5 minutes' ) return new Date(now.getTime() +       5 * 60 * 1000);
    if(expiresAt === '30 minutes') return new Date(now.getTime() +      30 * 60 * 1000);
    if(expiresAt === '1 hour'    ) return new Date(now.getTime() +  1 * 60 * 60 * 1000);
    if(expiresAt === '6 hours'   ) return new Date(now.getTime() +  6 * 60 * 60 * 1000);
    if(expiresAt === '12 hours'  ) return new Date(now.getTime() + 12 * 60 * 60 * 1000);
    if(expiresAt === '1 day'     ) return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    throw new Error('Invalid Expires At');
  }
}
