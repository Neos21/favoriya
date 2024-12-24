import { NestMinioService } from 'nestjs-minio';
import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EmojiEntity } from '../../shared/entities/emoji.entity';
import { EmojisService } from './emojis.service';

describe('EmojisService', () => {
  let service: EmojisService;
  let fakeEmojisRepository: Partial<Repository<EmojiEntity>>;
  let fakeNestMinioService: Partial<NestMinioService>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmojisService,
        { provide: getRepositoryToken(EmojiEntity), useValue: fakeEmojisRepository },
        { provide: NestMinioService, useValue: fakeNestMinioService }
      ]
    }).compile();
    
    service = module.get<EmojisService>(EmojisService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
