import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FollowEntity } from '../../../shared/entities/follow.entity';
import { FollowersService } from './followers.service';

describe('FollowersService', () => {
  let service: FollowersService;
  let fakeFollowsRepository: Partial<Repository<FollowEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowersService,
        { provide: getRepositoryToken(FollowEntity), useValue: fakeFollowsRepository }
      ]
    }).compile();
    
    service = module.get<FollowersService>(FollowersService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
