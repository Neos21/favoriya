import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FollowEntity } from '../../../shared/entities/follow.entity';
import { NotificationEntity } from '../../../shared/entities/notification.entity';
import { UserEntity } from '../../../shared/entities/user.entity';
import { NotificationsService } from '../../notifications/notifications.service';

import type { Result } from '../../../common/types/result';
import type { FollowRelationship } from '../../../common/types/follow-relationship';

/** Followers Service */
@Injectable()
export class FollowersService {
  private readonly logger: Logger = new Logger(FollowersService.name);
  
  constructor(
    @InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity) private readonly followsRepository: Repository<FollowEntity>,
    private readonly notificationsService: NotificationsService
  ) { }
  
  /** `userId` のフォロワー (`userId` のことをフォローしているユーザ) 一覧を取得する */
  public async findAll(userId: string): Promise<Result<Array<UserEntity>>> {
    try {
      const followers = await this.followsRepository.find({
        select: { following: {
          id       : true,
          name     : true,
          avatarUrl: true
        } },
        where: { followerUserId: userId },
        relations: ['following'],
        order: { id: 'DESC' }
      });
      const followerUsers: Array<UserEntity> = followers.map(follower => follower.following);
      return { result: followerUsers };
    }
    catch(error) {
      this.logger.error('対象ユーザのフォロワー一覧の取得に失敗', error);
      return { error: '対象ユーザのフォロワー一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** `followingUserId` と `followerUserId` のフォロー関係の情報を取得する */
  public async getRelationship(followerUserId: string, followingUserId: string): Promise<Result<FollowRelationship>> {
    if(followerUserId === followingUserId) return { error: '同じユーザが指定されています', code: HttpStatus.BAD_REQUEST };
    try {
      // followingUser が followerUser をフォローしているか否か
      const followingToFollower = await this.followsRepository.findOneBy({ followerUserId, followingUserId });
      // followerUser が followingUser をフォローしているか否か
      const followerToFollowing = await this.followsRepository.findOneBy({ followerUserId: followingUserId, followingUserId: followerUserId });
      
      const relationship = followingToFollower != null && followerToFollowing != null ? '相互フォロー'
        : followingToFollower != null ? `Following User [${followingUserId}] は Follower User [${followerUserId}] をフォローしています`
        : followerToFollowing != null ? `Following User [${followingUserId}] は Follower User [${followerUserId}] にフォローされています`
        : 'お互いにフォローしていません';
      return {
        result: {
          relationship,
          followingUserId,
          followerUserId,
          followingToFollower,
          followerToFollowing
        }
      }
    }
    catch(error) {
      this.logger.error('対象ユーザ間のフォロー状況の取得に失敗', error);
      return { error: '対象ユーザ間のフォロー状況の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** `followingUserId` が `followerUserId` のことをフォローする */
  public async follow(followerUserId: string, followingUserId: string): Promise<Result<boolean>> {
    if(followerUserId === followingUserId) return { error: 'フォローするユーザと、フォローしようとしている相手ユーザの ID が同一です', code: HttpStatus.BAD_REQUEST };
    
    try {
      const follower = await this.usersRepository.findOneBy({ id: followerUserId });
      if(follower == null) return { error: 'フォロー対象ユーザが見つかりません', code: HttpStatus.NOT_FOUND };
    }
    catch(error) {
      this.logger.error('フォロー対象ユーザの取得に失敗', error);
      return { error: 'フォロー対象ユーザの取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    try {
      const following = await this.usersRepository.findOneBy({ id: followingUserId });
      if(following == null) return { error: 'フォローしようとしているログインユーザの情報が見つかりません', code: HttpStatus.NOT_FOUND };
    }
    catch(error) {
      this.logger.error('フォローしようとしているログインユーザの情報取得に失敗', error);
      return { error: 'フォローしようとしているログインユーザの情報取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    try {
      await this.followsRepository.insert({ followerUserId, followingUserId });
    }
    catch(error) {
      this.logger.error('フォロー情報の登録に失敗', error);
      return { error: 'フォロー情報の登録に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    // フォロー通知を飛ばす
    const notificationEntity = new NotificationEntity({
      notificationType: 'follow',
      message         : `@${followingUserId} さんがあなたをフォローしました`,
      recipientUserId : followerUserId,
      actorUserId     : followingUserId
    });
    await this.notificationsService.create(notificationEntity);  // エラーは無視する
    
    return { result: true };
  }
  
  /** `followingUserId` が `followerUserId` のフォローを外す */
  public async unfollow(followerUserId: string, followingUserId: string): Promise<Result<boolean>> {
    try {
      const follower = await this.usersRepository.findOneBy({ id: followerUserId });
      if(follower == null) return { error: 'アンフォロー対象ユーザが見つかりません', code: HttpStatus.NOT_FOUND };
    }
    catch(error) {
      this.logger.error('アンフォロー対象ユーザの取得に失敗', error);
      return { error: 'アンフォロー対象ユーザの取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    try {
      const following = await this.usersRepository.findOneBy({ id: followingUserId });
      if(following == null) return { error: 'アンフォローしようとしているログインユーザの情報が見つかりません', code: HttpStatus.NOT_FOUND };
    }
    catch(error) {
      this.logger.error('アンフォローしようとしているログインユーザの情報取得に失敗', error);
      return { error: 'アンフォローしようとしているログインユーザの情報取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    try {
      const deleteResult = await this.followsRepository.delete({ followerUserId, followingUserId });
      if(deleteResult.affected === 0) return { error: '削除対象のフォロー関係は存在しませんでした', code: HttpStatus.NOT_FOUND };
      if(deleteResult.affected !== 1) {
        this.logger.error('アンフォロー処理で2件以上の削除が発生', deleteResult);
        return { error: 'アンフォロー処理で問題が発生', code: HttpStatus.INTERNAL_SERVER_ERROR };
      }
      return { result: true };
    }
    catch(error) {
      this.logger.error('フォロー情報の削除 (アンフォロー) に失敗', error);
      return { error: 'フォロー情報の削除 (アンフォロー) に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
