import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { FollowersController } from './followers.controller';
import { FollowersService } from './followers.service';

describe('FollowersController', () => {
  let controller: FollowersController;
  let fakeFollowersService: Partial<FollowersService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowersController],
      providers: [{ provide: FollowersService, useValue: fakeFollowersService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<FollowersController>(FollowersController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
