import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let fakeAdminService: Partial<AdminService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: fakeAdminService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<AdminController>(AdminController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
