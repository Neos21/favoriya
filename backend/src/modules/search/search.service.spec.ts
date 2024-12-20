import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PostEntity } from '../../shared/entities/post.entity';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let fakePostsRepository: Partial<Repository<PostEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getRepositoryToken(PostEntity), useValue: fakePostsRepository }
      ]
    }).compile();
    
    service = module.get<SearchService>(SearchService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
