import { NestMinioService } from 'nestjs-minio';
import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PollOptionEntity } from '../../../shared/entities/poll-option.entity';
import { PollEntity } from '../../../shared/entities/poll.entity';
import { PostEntity } from '../../../shared/entities/post.entity';
import { PostDecorationService } from './post-decoration.service';
import { PostValidationService } from './post-validation.service';
import { PostsService } from './posts.service';

describe('PostsService', () => {
  let service: PostsService;
  let fakePostsRepository: Partial<Repository<PostEntity>>;
  let fakePollsRepository: Partial<Repository<PollEntity>>;
  let fakePollOptionsRepository: Partial<Repository<PollOptionEntity>>;
  let fakeNestMinioService: Partial<NestMinioService>;
  let fakePostValidationService: Partial<PostValidationService>;
  let fakePostDecorationService: Partial<PostDecorationService>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(PostEntity), useValue: fakePostsRepository },
        { provide: getRepositoryToken(PollEntity), useValue: fakePollsRepository },
        { provide: getRepositoryToken(PollOptionEntity), useValue: fakePollOptionsRepository },
        { provide: NestMinioService, useValue: fakeNestMinioService },
        { provide: PostValidationService, useValue: fakePostValidationService },
        { provide: PostDecorationService, useValue: fakePostDecorationService }
      ]
    }).compile();
    
    service = module.get<PostsService>(PostsService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
