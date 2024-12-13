import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FollowEntity } from '../../../shared/entities/follow.entity';
import { UserEntity } from '../../../shared/entities/user.entity';
import { FollowingsService } from './followings.service';

describe('FollowingsService', () => {
  let service: FollowingsService;
  let fakeUsersRepository: Partial<Repository<UserEntity>>;
  let fakeFollowsRepository: Partial<Repository<FollowEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowingsService,
        { provide: getRepositoryToken(UserEntity), useValue: fakeUsersRepository },
        { provide: getRepositoryToken(FollowEntity), useValue: fakeFollowsRepository }
      ]
    }).compile();
    
    service = module.get<FollowingsService>(FollowingsService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
