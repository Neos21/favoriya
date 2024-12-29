import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FavouriteEntity } from '../../shared/entities/favourite.entity';
import { FollowEntity } from '../../shared/entities/follow.entity';
import { IntroductionEntity } from '../../shared/entities/introduction.entity';
import { NotificationEntity } from '../../shared/entities/notification.entity';
import { PostEntity } from '../../shared/entities/post.entity';
import { UserEntity } from '../../shared/entities/user.entity';
import { AvatarService } from './avatar/avatar.service';
import { PollsService } from './posts/polls/polls.service';
import { PostAttachmentsService } from './posts/post-attachments.service';
import { UsersService } from './users.service';

import type { Result } from '../../common/types/result';

/** User Deletion Service */
@Injectable()
export class UserDeletionService {
  private readonly logger: Logger = new Logger(UserDeletionService.name);
  
  constructor(
    @InjectRepository(FavouriteEntity) private readonly favouritesRepository: Repository<FavouriteEntity>,
    @InjectRepository(PostEntity) private readonly postsRepository: Repository<PostEntity>,
    @InjectRepository(FollowEntity) private readonly followsRepository: Repository<FollowEntity>,
    @InjectRepository(IntroductionEntity) private readonly introductionsRepository: Repository<IntroductionEntity>,
    @InjectRepository(NotificationEntity) private readonly notificationsRepository: Repository<NotificationEntity>,
    @InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
    private readonly usersService: UsersService,
    private readonly avatarService: AvatarService,
    private readonly pollsService: PollsService,
    private readonly postAttachmentsService: PostAttachmentsService
  ) { }
  
  /** ユーザアカウント (紐付く情報全て) を削除する */
  public async remove(id: string): Promise<Result<boolean>> {
    // ユーザの存在チェック・兼・現在のデータ取得
    const userResult = await this.usersService.findOneById(id);
    if(userResult.error != null) return userResult as Result<boolean>;
    
    // アバター画像ファイルがあれば削除する
    const removeAvadarResult = await this.avatarService.remove(id);
    if(removeAvadarResult.error != null) return removeAvadarResult;
    
    // ユーザが行ったふぁぼを削除する
    try {
      const deleteResult = await this.favouritesRepository.delete({ userId: id });
      this.logger.debug(`ふぁぼ削除 [${deleteResult.affected}] 件`);
    }
    catch(error) {
      this.logger.error('当該ユーザのふぁぼの削除に失敗', error);
      return { error: '当該ユーザのふぁぼの削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    // ユーザに紐付く投稿のアンケートを全て削除する
    const deletePollsResult = await this.pollsService.removeAllByUserId(id);
    if(deletePollsResult.error != null) return deletePollsResult;
    
    // ユーザに紐付く投稿の添付ファイルを全て削除する
    const deleteAttachmentsResult = await this.postAttachmentsService.removeAllByUserId(id);
    if(deleteAttachmentsResult.error != null) return deleteAttachmentsResult;
    
    // ユーザに紐付く投稿を全て削除する
    try {
      const deleteResult = await this.postsRepository.delete({ userId: id });
      this.logger.debug(`投稿削除 [${deleteResult.affected}] 件`);
    }
    catch(error) {
      this.logger.error('当該ユーザの全投稿の削除に失敗', error);
      return { error: '当該ユーザの全投稿の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    // ユーザがフォローした情報を全て削除する
    try {
      const deleteResult = await this.followsRepository.delete({ followingUserId: id });
      this.logger.debug(`フォロー情報削除 [${deleteResult.affected}] 件`);
    }
    catch(error) {
      this.logger.error('フォロー情報の削除に失敗', error);
      return { error: 'フォロー情報の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    // ユーザがフォローされた情報を全て削除する
    try {
      const deleteResult = await this.followsRepository.delete({ followerUserId: id });
      this.logger.debug(`フォロワー情報削除 [${deleteResult.affected}] 件`);
    }
    catch(error) {
      this.logger.error('フォロワー情報の削除に失敗', error);
      return { error: 'フォロワー情報の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    // ユーザが発信者である通知を全て削除する
    try {
      const deleteResult = await this.notificationsRepository.delete({ actorUserId: id });
      this.logger.debug(`送信通知削除 [${deleteResult.affected}] 件`);
    }
    catch(error) {
      this.logger.error('送信通知の削除に失敗', error);
      return { error: '送信通知の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    // ユーザが受信者である通知を全て削除する
    try {
      const deleteResult = await this.notificationsRepository.delete({ recipientUserId: id });
      this.logger.debug(`受信通知削除 [${deleteResult.affected}] 件`);
    }
    catch(error) {
      this.logger.error('受信通知の削除に失敗', error);
      return { error: '受信通知の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    // ユーザが紹介した紹介文を全て削除する
    try {
      const deleteResult = await this.introductionsRepository.delete({ actorUserId: id });
      this.logger.debug(`紹介文削除 [${deleteResult.affected}] 件`);
    }
    catch(error) {
      this.logger.error('紹介文の削除に失敗', error);
      return { error: '紹介文の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    // ユーザが紹介された紹介文を全て削除する
    try {
      const deleteResult = await this.introductionsRepository.delete({ recipientUserId: id });
      this.logger.debug(`被紹介文削除 [${deleteResult.affected}] 件`);
    }
    catch(error) {
      this.logger.error('被紹介文の削除に失敗', error);
      return { error: '被紹介文の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    // ユーザ情報を削除する : 基本は親であるユーザの削除によって子エンティティは連動して削除されるようにしているが、念のため前述のとおり子エンティティを先に消している
    try {
      const deleteResult = await this.usersRepository.delete({ id });
      if(deleteResult.affected !== 1) {
        this.logger.error('ユーザ情報の削除処理で0件 or 2件以上の削除が発生', deleteResult);
        return { error: 'ユーザ情報の削除処理で問題が発生', code: HttpStatus.INTERNAL_SERVER_ERROR };
      }
      this.logger.debug('ユーザ情報を削除');
      return { result: true };
    }
    catch(error) {
      this.logger.error('ユーザ情報の削除処理に失敗', error);
      return { error: 'ユーザ情報の削除処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
