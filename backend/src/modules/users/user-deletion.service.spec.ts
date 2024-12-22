import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FavouriteEntity } from '../../shared/entities/favourite.entity';
import { FollowEntity } from '../../shared/entities/follow.entity';
import { IntroductionEntity } from '../../shared/entities/introduction.entity';
import { NotificationEntity } from '../../shared/entities/notification.entity';
import { PostEntity } from '../../shared/entities/post.entity';
import { UserEntity } from '../../shared/entities/user.entity';
import { AvatarService } from './avatar/avatar.service';
import { UserDeletionService } from './user-deletion.service';
import { UsersService } from './users.service';

describe('UserDeletionService', () => {
  let service: UserDeletionService;
  let fakeFavouritesRepository: Partial<Repository<FavouriteEntity>>;
  let fakePostsRepository: Partial<Repository<PostEntity>>;
  let fakeFollowsRepository: Partial<Repository<FollowEntity>>;
  let fakeIntroductionsRepository: Partial<Repository<IntroductionEntity>>;
  let fakeNotificationsRepository: Partial<Repository<NotificationEntity>>;
  let fakeUsersRepository: Partial<Repository<UserEntity>>;
  let fakeUsersService: Partial<UsersService>;
  let fakeAvatarService: Partial<AvatarService>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDeletionService,
        { provide: getRepositoryToken(FavouriteEntity), useValue: fakeFavouritesRepository },
        { provide: getRepositoryToken(PostEntity), useValue: fakePostsRepository },
        { provide: getRepositoryToken(FollowEntity), useValue: fakeFollowsRepository },
        { provide: getRepositoryToken(IntroductionEntity), useValue: fakeIntroductionsRepository },
        { provide: getRepositoryToken(NotificationEntity), useValue: fakeNotificationsRepository },
        { provide: getRepositoryToken(UserEntity), useValue: fakeUsersRepository },
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AvatarService, useValue: fakeAvatarService }
      ]
    }).compile();
    
    service = module.get<UserDeletionService>(UserDeletionService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
