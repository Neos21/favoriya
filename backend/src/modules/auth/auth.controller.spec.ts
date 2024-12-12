import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let fakeAuthService: Partial<AuthService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: fakeAuthService }]
    })
    .overrideGuard(JwtAuthGuard)
    .useValue(fakeJwtAuthGuard)
    .compile();
    
    controller = module.get<AuthController>(AuthController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
