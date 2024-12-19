import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { IntroductionsController } from './introductions.controller';
import { IntroductionsService } from './introductions.service';

describe('IntroductionsController', () => {
  let controller: IntroductionsController;
  let fakeIntroductionsService: Partial<IntroductionsService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntroductionsController],
      providers: [{ provide: IntroductionsService, useValue: fakeIntroductionsService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<IntroductionsController>(IntroductionsController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
