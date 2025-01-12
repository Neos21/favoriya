import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { NotificationEntity } from '../../../../shared/entities/notification.entity';
import { PostEntity } from '../../../../shared/entities/post.entity';
import { postsQueryBuilder } from '../../../../shared/helpers/posts-query-builder';
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
      const posts = await postsQueryBuilder(this.postsRepository, true)
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
  public async create(inReplyToUserId: string, inReplyToPostId: string, post: Post, file?: Express.Multer.File): Promise<Result<boolean>> {
    post.inReplyToPostId = inReplyToPostId;
    post.inReplyToUserId = inReplyToUserId;
    const postResult = await this.postsService.create(post, file);
    if(postResult.error != null) return postResult;
    
    // 本人によるリプライや、システムユーザへのリプライを除いて通知を流す
    if(inReplyToUserId !== post.userId && !['anonymous', 'shumai'].includes(inReplyToUserId)) {
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
