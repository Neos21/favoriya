import { Test, TestingModule } from '@nestjs/testing';

import { PublicController } from './public.controller';
import { PublicService } from './public.service';

describe('PublicController', () => {
  let controller: PublicController;
  let fakePublicService: Partial<PublicService>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicController],
      providers: [{ provide: PublicService, useValue: fakePublicService }]
    }).compile();
    
    controller = module.get<PublicController>(PublicController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
