import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PollOptionEntity } from '../../../../shared/entities/poll-option.entity';
import { PollVoteEntity } from '../../../../shared/entities/poll-vote.entity';
import { PollEntity } from '../../../../shared/entities/poll.entity';
import { PollsService } from './polls.service';

describe('PollsService', () => {
  let service: PollsService;
  let fakePollsRepository: Partial<Repository<PollEntity>>;
  let fakePollOptionsRepository: Partial<Repository<PollOptionEntity>>;
  let fakePollVotesRepository: Partial<Repository<PollVoteEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollsService,
        { provide: getRepositoryToken(PollEntity), useValue: fakePollsRepository },
        { provide: getRepositoryToken(PollOptionEntity), useValue: fakePollOptionsRepository },
        { provide: getRepositoryToken(PollVoteEntity), useValue: fakePollVotesRepository }
      ]
    }).compile();
    
    service = module.get<PollsService>(PollsService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
