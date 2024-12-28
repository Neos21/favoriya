import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

describe('PostsController', () => {
  let controller: PostsController;
  let fakePostsService: Partial<PostsService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: fakePostsService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<PostsController>(PostsController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
