import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FollowEntity } from '../../../shared/entities/follow.entity';
import { UserEntity } from '../../../shared/entities/user.entity';

import type { Result } from '../../../common/types/result';

/** Followings Service */
@Injectable()
export class FollowingsService {
  private readonly logger: Logger = new Logger(FollowingsService.name);
  
  constructor(@InjectRepository(FollowEntity) private readonly followsRepository: Repository<FollowEntity>) { }
  
  /** `userId` がフォローしているユーザ一覧を取得する */
  public async findAll(userId: string): Promise<Result<Array<UserEntity>>> {
    try {
      const followings = await this.followsRepository.find({
        select: { follower: {
          id: true,
          name: true,
          avatarUrl: true
        } },
        where: { followingUserId: userId },
        relations: ['follower'],
        order: { id: 'DESC' }
      });
      const followingUsers: Array<UserEntity> = followings.map(following => following.follower);
      return { result: followingUsers };
    }
    catch(error) {
      this.logger.error('対象ユーザがフォロー中であるユーザ一覧の取得に失敗', error);
      return { error: '対象ユーザがフォロー中であるユーザ一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
