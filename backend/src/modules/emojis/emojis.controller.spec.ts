import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { EmojisController } from './emojis.controller';
import { EmojisService } from './emojis.service';

describe('EmojisController', () => {
  let controller: EmojisController;
  let fakeEmojisService: Partial<EmojisService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmojisController],
      providers: [{ provide: EmojisService, useValue: fakeEmojisService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<EmojisController>(EmojisController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
