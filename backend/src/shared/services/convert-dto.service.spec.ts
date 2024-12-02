import { Test, TestingModule } from '@nestjs/testing';

import { ConvertDtoService } from './convert-dto.service';

describe('ConvertDtoService', () => {
  let service: ConvertDtoService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConvertDtoService]
    }).compile();
    
    service = module.get<ConvertDtoService>(ConvertDtoService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
