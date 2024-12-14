import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FavouriteEntity } from '../../../../shared/entities/favourite.entity';
import { PostEntity } from '../../../../shared/entities/post.entity';
import { NotificationsService } from '../../../notifications/notifications.service';
import { FavouritesService } from './favourites.service';

describe('FavouritesService', () => {
  let service: FavouritesService;
  let fakeFavouritesRepository: Partial<Repository<FavouriteEntity>>;
  let fakePostsRepository: Partial<Repository<PostEntity>>;
  let fakeNotificationsService: Partial<NotificationsService>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavouritesService,
        { provide: getRepositoryToken(FavouriteEntity), useValue: fakeFavouritesRepository },
        { provide: getRepositoryToken(PostEntity), useValue: fakePostsRepository },
        { provide: NotificationsService, useValue: fakeNotificationsService }
      ]
    }).compile();
    
    service = module.get<FavouritesService>(FavouritesService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
