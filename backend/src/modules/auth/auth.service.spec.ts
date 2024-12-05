import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService }
      ]
    }).compile();
    
    service = module.get<AuthService>(AuthService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
