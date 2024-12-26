import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';

describe('PollsController', () => {
  let controller: PollsController;
  let fakePollsService: Partial<PollsService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PollsController],
      providers: [{ provide: PollsService, useValue: fakePollsService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<PollsController>(PollsController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
