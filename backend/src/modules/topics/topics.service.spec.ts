import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TopicEntity } from '../../shared/entities/topic.entity';
import { TopicsService } from './topics.service';

describe('TopicsService', () => {
  let service: TopicsService;
  let fakeTopicsRepository: Partial<Repository<TopicEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicsService,
        { provide: getRepositoryToken(TopicEntity), useValue: fakeTopicsRepository }
      ]
    }).compile();
    
    service = module.get<TopicsService>(TopicsService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
