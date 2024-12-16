import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { LoginHistoryEntity } from '../../shared/entities/login-history.entity';
import { UserEntity } from '../../shared/entities/user.entity';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let fakeLoginHistoriesRepository: Partial<Repository<LoginHistoryEntity>>;
  let fakeUsersRepository: Partial<Repository<UserEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(LoginHistoryEntity), useValue: fakeLoginHistoriesRepository },
        { provide: getRepositoryToken(UserEntity), useValue: fakeUsersRepository }
      ]
    }).compile();
    
    service = module.get<AdminService>(AdminService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
