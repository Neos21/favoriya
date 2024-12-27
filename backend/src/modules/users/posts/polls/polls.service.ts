import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PollVoteEntity } from '../../../../shared/entities/poll-vote.entity';
import { PollEntity } from '../../../../shared/entities/poll.entity';

import type { Result } from '../../../../common/types/result';

/** Polls Service */
@Injectable()
export class PollsService {
  private readonly logger: Logger = new Logger(PollsService.name);
  
  constructor(
    @InjectRepository(PollEntity) private readonly pollsRepository: Repository<PollEntity>,
    @InjectRepository(PollVoteEntity) private readonly pollVotesRepository: Repository<PollVoteEntity>
  ) { }
  
  /** アンケートを取得する */
  public async findOne(postsUserId: string, postId: string): Promise<Result<PollEntity>> {
    try {
      const pollEntity = await this.pollsRepository.findOne({
        where: {
          userId: postsUserId,
          postId
        },
        relations: ['pollOptions', 'pollVotes']
      });
      if(pollEntity == null) return { error: '対象のアンケートが見つかりません', code: HttpStatus.NOT_FOUND };
      return { result: pollEntity };
    }
    catch(error) {
      this.logger.error('アンケートの取得に失敗', error);
      return { error: 'アンケートの取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 投票する */
  public async vote(pollId: number, pollOptionId: number, userId: string): Promise<Result<boolean>> {
    try {
      const pollEntity = await this.pollsRepository.findOneBy({ id: pollId });
      if(pollEntity == null) return { error: '対象のアンケートが見つかりません', code: HttpStatus.NOT_FOUND };
      if(pollEntity.expiresAt < new Date()) return { error: '対象のアンケートは期限切れです', code: HttpStatus.BAD_REQUEST };
      
      await this.pollVotesRepository.insert({ pollId, pollOptionId, userId });
      return { result: true };
    }
    catch(error) {
      this.logger.error('アンケートの取得に失敗', error);
      return { error: 'アンケートの取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
