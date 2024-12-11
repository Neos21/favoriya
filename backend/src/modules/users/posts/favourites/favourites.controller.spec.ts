import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { FavouritesController } from './favourites.controller';
import { FavouritesService } from './favourites.service';

describe('FavouritesController', () => {
  let controller: FavouritesController;
  let fakeFavouritesService: Partial<FavouritesService>;
  
  beforeEach(async () => {
    const fakeJwtAuthGuard = jest.fn(() => true);
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavouritesController],
      providers: [{ provide: FavouritesService, useValue: fakeFavouritesService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtAuthGuard)
      .compile();
    
    controller = module.get<FavouritesController>(FavouritesController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
