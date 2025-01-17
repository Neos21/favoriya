import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RepliesController } from './replies.controller';
import { RepliesService } from './replies.service';

describe('RepliesController', () => {
  let controller: RepliesController;
  let fakeRepliesService: Partial<RepliesService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepliesController],
      providers: [{ provide: RepliesService, useValue: fakeRepliesService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<RepliesController>(RepliesController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
