import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PostEntity } from '../../shared/entities/post.entity';
import { TimelineService } from './timeline.service';

describe('TimelineService', () => {
  let service: TimelineService;
  let fakePostsRepository: Partial<Repository<PostEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimelineService,
        { provide: getRepositoryToken(PostEntity), useValue: fakePostsRepository }
      ]
    }).compile();
    
    service = module.get<TimelineService>(TimelineService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
