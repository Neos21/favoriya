import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UserEntity } from '../../shared/entities/user.entity';
import { PublicService } from './public.service';

describe('PublicService', () => {
  let service: PublicService;
  let fakeUsersRepository: Partial<Repository<UserEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicService,
        { provide: getRepositoryToken(UserEntity), useValue: fakeUsersRepository }
      ]
    }).compile();
    
    service = module.get<PublicService>(PublicService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
