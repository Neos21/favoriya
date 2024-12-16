import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { topicsConstants } from '../../common/constants/topics-constants';
import { TopicEntity } from '../../shared/entities/topic.entity';

/** Topics Service */
@Injectable()
export class TopicsService {
  private readonly logger: Logger = new Logger(TopicsService.name);
  
  constructor(@InjectRepository(TopicEntity) private readonly topicsRepository: Repository<TopicEntity>) { }
  
  /** トピック定義を初期投入する */
  public async onModuleInit(): Promise<void> {
    const topics = Object.values(topicsConstants);
    for(const topic of topics) {
      await this.topicsRepository.save(new TopicEntity({ id: topic.id, name: topic.name })).catch(_error => {});
    }
    this.logger.debug('トピック定義の初期投入完了');
  }
}
