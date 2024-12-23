import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { NotificationEntity } from '../../../../shared/entities/notification.entity';
import { PostEntity } from '../../../../shared/entities/post.entity';
import { NotificationsService } from '../../../notifications/notifications.service';
import { PostsService } from '../posts.service';

import type { Result } from '../../../../common/types/result';
import type { Post } from '../../../../common/types/post';

/** Replies Service */
@Injectable()
export class RepliesService {
  private readonly logger: Logger = new Logger(RepliesService.name);
  
  constructor(
    @InjectRepository(PostEntity) private readonly postsRepository: Repository<PostEntity>,
    private readonly postsService: PostsService,
    private readonly notificationsService: NotificationsService
  ) { }
  
  /** 指定の ID に対するリプライ一覧を取得する */
  public async findAllAfterReplies(inReplyToUserId: string, inReplyToPostId: string): Promise<Result<Array<PostEntity>>> {
    try {
      const posts = await this.postsRepository
        .createQueryBuilder('posts')
        .select(['posts.id', 'posts.userId', 'posts.text', 'posts.topicId', 'posts.favouritesCount', 'posts.createdAt'])  // 投稿内容 : ココではリプライ元を取得しない
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
        .where('posts.in_reply_to_post_id = :inReplyToPostId', { inReplyToPostId })  // 指定の投稿 ID
        .andWhere('posts.in_reply_to_user_id = :inReplyToUserId', { inReplyToUserId })  // 指定のユーザ ID
        .orderBy('posts.createdAt', 'ASC')  // created_at の昇順 (古いモノが上に並ぶようにする)
        .getMany();
      return { result: posts };
    }
    catch(error) {
      this.logger.error('リプライ一覧の取得に失敗', error);
      return { error: 'リプライ一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** リプライする */
  public async create(inReplyToUserId: string, inReplyToPostId: string, post: Post): Promise<Result<boolean>> {
    post.inReplyToPostId = inReplyToPostId;
    post.inReplyToUserId = inReplyToUserId;
    const postResult = await this.postsService.create(post);
    if(postResult.error != null) return postResult;
    
    if(inReplyToUserId !== post.userId) {
      const notificationEntity = new NotificationEntity({
        notificationType: 'reply',
        message         : `@${post.userId} さんがあなたの投稿にリプしました`,
        recipientUserId : inReplyToUserId,
        actorUserId     : post.userId,
        postId          : inReplyToPostId
      });
      await this.notificationsService.create(notificationEntity);  // エラーは無視する
    }
    
    return { result: true };
  }
}
