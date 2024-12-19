import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { IntroductionEntity } from '../../../shared/entities/introduction.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { IntroductionsService } from './introductions.service';

describe('IntroductionsService', () => {
  let service: IntroductionsService;
  let fakeIntroductionsRepository: Partial<Repository<IntroductionEntity>>;
  let fakeNotificationsService: Partial<NotificationsService>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntroductionsService,
        { provide: getRepositoryToken(IntroductionEntity), useValue: fakeIntroductionsRepository },
        { provide: NotificationsService, useValue: fakeNotificationsService }
      ]
    }).compile();
    
    service = module.get<IntroductionsService>(IntroductionsService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
