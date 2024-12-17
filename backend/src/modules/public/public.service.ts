import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../../shared/entities/user.entity';

import type { Result } from '../../common/types/result';

/** Public Service */
@Injectable()
export class PublicService {
  private readonly logger: Logger = new Logger(PublicService.name);
  
  constructor(@InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>) { }
  
  /** ユーザ数を取得する */
  public async getNumberOfUsers(): Promise<Result<number>> {
    try {
      const numberOfUsers = await this.usersRepository.count();
      return { result: numberOfUsers };
    }
    catch(error) {
      this.logger.error('ユーザ数の取得に失敗', error);
      return { result: -1 };  // エラー時は負数にして区別が付くようにする
    }
  }
}
