import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { NotificationEntity } from '../../shared/entities/notification.entity';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let fakeNotificationsRepository: Partial<Repository<NotificationEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(NotificationEntity), useValue: fakeNotificationsRepository }
      ]
    }).compile();
    
    service = module.get<NotificationsService>(NotificationsService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
