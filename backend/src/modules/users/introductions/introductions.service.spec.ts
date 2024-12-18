import { Test, TestingModule } from '@nestjs/testing';

import { IntroductionsService } from './introductions.service';

describe('IntroductionsService', () => {
  let service: IntroductionsService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntroductionsService]
    }).compile();
    
    service = module.get<IntroductionsService>(IntroductionsService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
