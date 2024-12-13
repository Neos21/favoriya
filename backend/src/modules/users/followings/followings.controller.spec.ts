import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { FollowingsController } from './followings.controller';
import { FollowingsService } from './followings.service';

describe('FollowingsController', () => {
  let controller: FollowingsController;
  let fakeFollowingsService: Partial<FollowingsService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowingsController],
      providers: [{ provide: FollowingsService, useValue: fakeFollowingsService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<FollowingsController>(FollowingsController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
