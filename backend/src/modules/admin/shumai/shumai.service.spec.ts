import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ShumaiService } from './shumai.service';
import { PostEntity } from '../../../shared/entities/post.entity';

describe('ShumaiService', () => {
  let service: ShumaiService;
  let fakePostsRepository: Partial<Repository<PostEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShumaiService,
        { provide: getRepositoryToken(PostEntity), useValue: fakePostsRepository }
      ]
    }).compile();
    
    service = module.get<ShumaiService>(ShumaiService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
