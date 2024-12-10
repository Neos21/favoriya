import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UserEntity } from '../../shared/entities/user.entity';
import { AvatarService } from './avatar/avatar.service';
import { PostsService } from './posts/posts.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let fakeUsersRepository: Partial<Repository<UserEntity>>;
  let fakeAvatarService: Partial<AvatarService>;
  let fakePostsService: Partial<PostsService>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useValue: fakeUsersRepository },
        { provide: AvatarService, useValue: fakeAvatarService },
        { provide: PostsService, useValue: fakePostsService }
      ]
    }).compile();
    
    service = module.get<UsersService>(UsersService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
