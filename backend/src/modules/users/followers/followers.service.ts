import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FollowEntity } from '../../../shared/entities/follow.entity';

import type { Result } from '../../../common/types/result';

/** Followers Service */
@Injectable()
export class FollowersService {
  private readonly logger: Logger = new Logger(FollowersService.name);
  
  constructor(@InjectRepository(FollowEntity) private readonly followsRepository: Repository<FollowEntity>) { }
  
  /** `userId` のフォロワー (`userId` のことをフォローしているユーザ) 一覧を取得する */
  public async findAll(userId: string): Promise<Result<Array<FollowEntity>>> {
    try {
      const followers = await this.followsRepository.find({
        where: { following: { id: userId } },
        relations: ['follower']
      });
      console.log(followers);  // TODO
      return { result: followers };
    }
    catch(error) {
      this.logger.error('対象ユーザのフォロワー一覧の取得に失敗', error);
      return { error: '対象ユーザのフォロワー一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** `followingUserId` が `followerUserId` のことをフォローしているかどうかの情報を取得する */
  public async findOne(followerUserId: string, followingUserId: string): Promise<Result<FollowEntity>> {
    try {
      const follower = await this.followsRepository.findOneBy({ followerUserId, followingUserId });
      console.log(follower);  // TODO
      return { result: follower };
    }
    catch(error) {
      this.logger.error('対象ユーザ間のフォロー状況の取得に失敗', error);
      return { error: '対象ユーザ間のフォロー状況の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
