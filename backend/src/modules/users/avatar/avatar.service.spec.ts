import { NestMinioService } from 'nestjs-minio';
import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UserEntity } from '../../../shared/entities/user.entity';
import { UsersService } from '../users.service';
import { AvatarService } from './avatar.service';

describe('AvatarService', () => {
  let service: AvatarService;
  let fakeUsersRepository: Partial<Repository<UserEntity>>;
  let fakeUsersService: Partial<UsersService>;
  let fakeNestMinioService: Partial<NestMinioService>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarService,
        { provide: getRepositoryToken(UserEntity), useValue: fakeUsersRepository },
        { provide: UsersService, useValue: fakeUsersService },
        { provide: NestMinioService, useValue: fakeNestMinioService }
      ]
    }).compile();
    
    service = module.get<AvatarService>(AvatarService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
