import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';

describe('AvatarController', () => {
  let controller: AvatarController;
  let fakeAvatarService: Partial<AvatarService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvatarController],
      providers: [{ provide: AvatarService, useValue: fakeAvatarService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<AvatarController>(AvatarController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
