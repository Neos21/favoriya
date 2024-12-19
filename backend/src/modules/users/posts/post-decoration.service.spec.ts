import { Test, TestingModule } from '@nestjs/testing';

import { PostDecorationService } from './post-decoration.service';

describe('PostDecorationService', () => {
  let service: PostDecorationService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostDecorationService]
    }).compile();
    
    service = module.get<PostDecorationService>(PostDecorationService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
