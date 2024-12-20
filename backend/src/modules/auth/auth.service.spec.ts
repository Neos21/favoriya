import { Repository } from 'typeorm';

import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { LoginHistoryEntity } from '../../shared/entities/login-history.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  let fakeLoginHistoriesRepository: Partial<Repository<LoginHistoryEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
        { provide: getRepositoryToken(LoginHistoryEntity), useValue: fakeLoginHistoriesRepository }
      ]
    }).compile();
    
    service = module.get<AuthService>(AuthService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
