import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { LoginHistoryEntity } from '../../../shared/entities/login-history.entity';

import type { LoginHistory } from '../../../common/types/login-history';
import type { Result } from '../../../common/types/result';

/** Login Histories Service */
@Injectable()
export class LoginHistoriesService {
  private readonly logger: Logger = new Logger(LoginHistoriesService.name);
  
  constructor(@InjectRepository(LoginHistoryEntity) private readonly loginHistoriesRepository: Repository<LoginHistoryEntity>) { }
  
  /** ユーザのログイン履歴一覧を取得する */
  public async findAll(userId: string): Promise<Result<Array<LoginHistory>>> {
    try {
      const loginHistories = await this.loginHistoriesRepository.find({
        where: { userId },
        order: { updatedAt: 'DESC' }
      });
      return { result: loginHistories };
    }
    catch(error) {
      this.logger.error('ログイン履歴一覧の取得に失敗', error);
      return { error: 'ログイン履歴一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
