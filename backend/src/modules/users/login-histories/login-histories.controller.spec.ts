import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { LoginHistoriesController } from './login-histories.controller';
import { LoginHistoriesService } from './login-histories.service';

describe('LoginHistoriesController', () => {
  let controller: LoginHistoriesController;
  let fakeLoginHistoriesService: Partial<LoginHistoriesService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginHistoriesController],
      providers: [{ provide: LoginHistoriesService, useValue: fakeLoginHistoriesService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<LoginHistoriesController>(LoginHistoriesController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
