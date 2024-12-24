import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { ShumaiController } from './shumai.controller';
import { ShumaiService } from './shumai.service';

describe('ShumaiController', () => {
  let controller: ShumaiController;
  let fakeShumaiService: Partial<ShumaiService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShumaiController],
      providers: [{ provide: ShumaiService, useValue: fakeShumaiService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<ShumaiController>(ShumaiController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
