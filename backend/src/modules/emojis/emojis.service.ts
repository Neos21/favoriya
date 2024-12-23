import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EmojiEntity } from '../../shared/entities/emoji.entity';

import type { Result } from '../../common/types/result';

/** Emojis Service */
@Injectable()
export class EmojisService {
  private readonly logger: Logger = new Logger(EmojisService.name);
  
  constructor(@InjectRepository(EmojiEntity) private readonly emojisRepository: Repository<EmojiEntity>) { }
  
  /** 絵文字リアクション情報一覧を削除する */
  public async findAll(): Promise<Result<Array<EmojiEntity>>> {
    try {
      const emojiEntities = await this.emojisRepository.find({ order: { createdAt: 'DESC' }});
      return { result: emojiEntities };
    }
    catch(error) {
      this.logger.error('絵文字リアクション一覧の取得に失敗', error);
      return { error: '絵文字リアクション一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
