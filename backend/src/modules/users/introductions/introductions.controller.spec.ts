import { Test, TestingModule } from '@nestjs/testing';

import { IntroductionsController } from './introductions.controller';

describe('IntroductionsController', () => {
  let controller: IntroductionsController;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntroductionsController]
    }).compile();
    
    controller = module.get<IntroductionsController>(IntroductionsController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
