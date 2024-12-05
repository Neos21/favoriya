import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';

describe('TimelineController', () => {
  let controller: TimelineController;
  let fakeTimelineService: Partial<TimelineService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimelineController],
      providers: [{ provide: TimelineService, useValue: fakeTimelineService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<TimelineController>(TimelineController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
