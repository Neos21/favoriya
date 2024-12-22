import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PostEntity } from '../../../../shared/entities/post.entity';
import { NotificationsService } from '../../../notifications/notifications.service';
import { PostsService } from '../posts.service';
import { RepliesService } from './replies.service';

describe('RepliesService', () => {
  let service: RepliesService;
  let fakePostsRepository: Partial<Repository<PostEntity>>;
  let fakePostsService: Partial<PostsService>;
  let fakeNotificationsService: Partial<NotificationsService>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepliesService,
        { provide: getRepositoryToken(PostEntity), useValue: fakePostsRepository },
        { provide: PostsService, useValue: fakePostsService },
        { provide: NotificationsService, useValue: fakeNotificationsService }
      ]
    }).compile();
    
    service = module.get<RepliesService>(RepliesService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
