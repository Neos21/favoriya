import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { UserDeletionService } from './user-deletion.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeUserDeletionService: Partial<UserDeletionService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: UserDeletionService, useValue: fakeUserDeletionService }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<UsersController>(UsersController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
