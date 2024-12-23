import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { AdminEmojisController } from './admin-emojis.controller';
import { AdminEmojisService } from './admin-emojis.service';

describe('AdminEmojisController', () => {
  let controller: AdminEmojisController;
  let fakeAdminEmojisService: Partial<AdminEmojisService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminEmojisController],
      providers: [{ provide: AdminEmojisService, useValue: fakeAdminEmojisService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<AdminEmojisController>(AdminEmojisController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
