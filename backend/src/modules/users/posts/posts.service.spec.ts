import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PollOptionEntity } from '../../../shared/entities/poll-option.entity';
import { PollEntity } from '../../../shared/entities/poll.entity';
import { PostEntity } from '../../../shared/entities/post.entity';
import { PostsService } from './posts.service';

describe('PostsService', () => {
  let service: PostsService;
  let fakePostsRepository: Partial<Repository<PostEntity>>;
  let fakePollsRepository: Partial<Repository<PollEntity>>;
  let fakePollOptionsRepository: Partial<Repository<PollOptionEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(PostEntity), useValue: fakePostsRepository },
        { provide: getRepositoryToken(PollEntity), useValue: fakePollsRepository },
        { provide: getRepositoryToken(PollOptionEntity), useValue: fakePollOptionsRepository }
      ]
    }).compile();
    
    service = module.get<PostsService>(PostsService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
