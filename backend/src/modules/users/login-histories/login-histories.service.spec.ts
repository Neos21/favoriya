import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { LoginHistoryEntity } from '../../../shared/entities/login-history.entity';
import { LoginHistoriesService } from './login-histories.service';

describe('LoginHistoriesService', () => {
  let service: LoginHistoriesService;
  let fakeLoginHistoriesRepository: Partial<Repository<LoginHistoryEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginHistoriesService,
        { provide: getRepositoryToken(LoginHistoryEntity), useValue: fakeLoginHistoriesRepository }
      ]
    }).compile();
    
    service = module.get<LoginHistoriesService>(LoginHistoriesService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
