import { NestMinioService } from 'nestjs-minio';
import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EmojiReactionEntity } from '../../../shared/entities/emoji-reaction.entity';
import { EmojiEntity } from '../../../shared/entities/emoji.entity';
import { AdminEmojisService } from './admin-emojis.service';

describe('AdminEmojisService', () => {
  let service: AdminEmojisService;
  let fakeEmojisRepository: Partial<Repository<EmojiEntity>>;
  let fakeEmojiReactionsRepository: Partial<Repository<EmojiReactionEntity>>;
  let fakeNestMinioService: Partial<NestMinioService>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminEmojisService,
        { provide: getRepositoryToken(EmojiEntity), useValue: fakeEmojisRepository },
        { provide: getRepositoryToken(EmojiReactionEntity), useValue: fakeEmojiReactionsRepository },
        { provide: NestMinioService, useValue: fakeNestMinioService }
      ]
    }).compile();
    
    service = module.get<AdminEmojisService>(AdminEmojisService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
