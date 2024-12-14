import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let fakeNotificationsService: Partial<NotificationsService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: fakeNotificationsService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<NotificationsController>(NotificationsController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
