import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { topicsConstants } from '../../../common/constants/topics-constants';
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
        userId         : post.topicId === topicsConstants.anonymous.id ? 'anonymous' : post.userId,
        text           : post.text,
        topicId        : post.topicId,
        visibility     : post.visibility,
        inReplyToPostId: post.inReplyToPostId,
        inReplyToUserId: post.inReplyToUserId
      });
      await this.postsRepository.insert(newPostEntity);
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
      const posts = await this.postsRepository
        .createQueryBuilder('posts')
        .select(['posts.id', 'posts.userId', 'posts.text', 'posts.topicId', 'posts.createdAt', 'posts.inReplyToPostId', 'posts.inReplyToUserId'])  // 投稿内容
        .leftJoin('posts.user', 'users')  // 投稿に対応する users を結合する
        .addSelect(['users.name', 'users.avatarUrl'])  // 投稿ユーザの情報
        .leftJoin('posts.favourites', 'favourites')  // 投稿に対する favourites を結合する
        .addSelect(['favourites.id'])
        .leftJoin('favourites.favouritedByUser', 'favourited_by_users')  // ふぁぼったユーザ情報
        .addSelect(['favourited_by_users.id', 'favourited_by_users.avatarUrl'])
        .leftJoin('posts.emojiReactions', 'emoji_reactions')  // 投稿に対応する EmojiReactionEntity を結合する
        .addSelect(['emoji_reactions.id', 'emoji_reactions.reactedPostsUserId', 'emoji_reactions.reactedPostId', 'emoji_reactions.userId', 'emoji_reactions.emojiId'])
        .leftJoin('emoji_reactions.emoji', 'emojis')  // EmojiEntity を結合する
        .addSelect(['emojis.id', 'emojis.name', 'emojis.imageUrl'])
        .leftJoin('emoji_reactions.reactionByUser', 'reaction_by_users')  // リアクションしたユーザ情報
        .addSelect(['reaction_by_users.id', 'reaction_by_users.avatarUrl'])
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
      const post = await this.postsRepository
        .createQueryBuilder('posts')
        .select(['posts.id', 'posts.userId', 'posts.text', 'posts.topicId', 'posts.createdAt', 'posts.inReplyToPostId', 'posts.inReplyToUserId'])  // 投稿内容
        .leftJoin('posts.user', 'users')  // 投稿に対応する users を結合する
        .addSelect(['users.name', 'users.avatarUrl'])  // 投稿ユーザの情報
        .leftJoin('posts.favourites', 'favourites')  // 投稿に対する favourites を結合する
        .addSelect(['favourites.id'])
        .leftJoin('favourites.favouritedByUser', 'favourited_by_users')  // ふぁぼったユーザ情報
        .addSelect(['favourited_by_users.id', 'favourited_by_users.avatarUrl'])
        .leftJoin('posts.emojiReactions', 'emoji_reactions')  // 投稿に対応する EmojiReactionEntity を結合する
        .addSelect(['emoji_reactions.id', 'emoji_reactions.reactedPostsUserId', 'emoji_reactions.reactedPostId', 'emoji_reactions.userId', 'emoji_reactions.emojiId'])
        .leftJoin('emoji_reactions.emoji', 'emojis')  // EmojiEntity を結合する
        .addSelect(['emojis.id', 'emojis.name', 'emojis.imageUrl'])
        .leftJoin('emoji_reactions.reactionByUser', 'reaction_by_users')  // リアクションしたユーザ情報
        .addSelect(['reaction_by_users.id', 'reaction_by_users.avatarUrl'])
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
}
