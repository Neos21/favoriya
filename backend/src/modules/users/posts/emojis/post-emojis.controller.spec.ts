import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { PostEmojisController } from './post-emojis.controller';
import { PostEmojisService } from './post-emojis.service';

describe('PostEmojisController', () => {
  let controller: PostEmojisController;
  let fakePostEmojisService: Partial<PostEmojisService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostEmojisController],
      providers: [{ provide: PostEmojisService, useValue: fakePostEmojisService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<PostEmojisController>(PostEmojisController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
