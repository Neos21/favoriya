import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { commonTopicsConstants } from '../../../common/constants/topics-constants';
import { PollOptionEntity } from '../../../shared/entities/poll-option.entity';
import { PollVoteEntity } from '../../../shared/entities/poll-vote.entity';
import { PollEntity } from '../../../shared/entities/poll.entity';
import { PostEntity } from '../../../shared/entities/post.entity';
import { postsQueryBuilder } from '../../../shared/helpers/posts-query-builder';
import { PostAttachmentsService } from './post-attachments.service';
import { PostDecorationService } from './post-decoration.service';
import { PostValidationService } from './post-validation.service';

import type { Post } from '../../../common/types/post';
import type { Result } from '../../../common/types/result';

/** Posts Service */
@Injectable()
export class PostsService {
  private readonly logger: Logger = new Logger(PostsService.name);
  
  constructor(
    @InjectRepository(PostEntity) private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(PollEntity) private readonly pollsRepository: Repository<PollEntity>,
    @InjectRepository(PollOptionEntity) private readonly pollOptionsRepository: Repository<PollOptionEntity>,
    @InjectRepository(PollVoteEntity) private readonly pollVotesRepository: Repository<PollVoteEntity>,
    private readonly postValidationService: PostValidationService,
    private readonly postDecorationService: PostDecorationService,
    private readonly postAttachmentsService: PostAttachmentsService
  ) { }
  
  /** 投稿する */
  public async create(post: Post, file?: Express.Multer.File): Promise<Result<boolean>> {
    // トピックごとに入力チェックする
    const validationResult = this.postValidationService.validateText(post.text, post.topicId);
    if(validationResult.error != null) return validationResult;
    
    // 川柳モードの時にスタイリングできそうならする
    if(post.topicId === commonTopicsConstants.senryu.id) post.text = this.postDecorationService.senryuStyle(post.text);
    // ランダム装飾モードの場合に行ごとにタグを入れたり入れなかったりする
    if(post.topicId === commonTopicsConstants.randomDecorations.id) post.text = this.postDecorationService.decorateRandomly(post.text);
    // 勝手に AI 生成モードの場合にテキストを変更してもらう
    if(post.topicId === commonTopicsConstants.aiGenerated.id) post.text = await this.postDecorationService.generateByAi(post.text);
    
    try {
      const newPostEntity = new PostEntity({
        userId         : post.topicId === commonTopicsConstants.anonymous.id ? 'anonymous' : post.userId,
        text           : post.text,
        topicId        : post.topicId,
        visibility     : post.visibility,
        inReplyToPostId: post.inReplyToPostId,
        inReplyToUserId: post.inReplyToUserId,
        hasPoll        : post.topicId === commonTopicsConstants.poll.id
      });
      const createdPostEntity = await this.postsRepository.save(newPostEntity);
      
      // アンケートモード
      if(post.topicId === commonTopicsConstants.poll.id) {
        const result = await this.createPoll(post, createdPostEntity);
        if(result.error != null) return result;
      }
      
      if(file != null) {
        const result = await this.postAttachmentsService.save(file, createdPostEntity);
        if(result.error != null) return result as Result<boolean>;
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
      
      // Poll を削除する
      const pollEntity = await this.pollsRepository.findOneBy({ userId, postId });
      if(pollEntity != null) {
        await this.pollOptionsRepository.delete({ pollId: pollEntity.id });
        await this.pollVotesRepository.delete({ pollId: pollEntity.id });
        await this.pollsRepository.delete({ id: pollEntity.id });
      }
      
      // Attachment を削除する
      await this.postAttachmentsService.remove(userId, postId);
      
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
  
  /** アンケート期限の日時を生成する */
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
