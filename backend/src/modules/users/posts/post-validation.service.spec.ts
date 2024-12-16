import { Test, TestingModule } from '@nestjs/testing';

import { PostValidationService } from './post-validation.service';

describe('PostValidationService', () => {
  let service: PostValidationService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostValidationService]
    }).compile();
    
    service = module.get<PostValidationService>(PostValidationService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
