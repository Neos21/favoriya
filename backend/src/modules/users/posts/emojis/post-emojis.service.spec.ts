import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EmojiReactionEntity } from '../../../../shared/entities/emoji-reaction.entity';
import { PostEmojisService } from './post-emojis.service';

describe('PostEmojisService', () => {
  let service: PostEmojisService;
  let fakePostEmojisRepository: Partial<Repository<EmojiReactionEntity>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostEmojisService,
        { provide: getRepositoryToken(EmojiReactionEntity), useValue: fakePostEmojisRepository }
      ]
    }).compile();
    
    service = module.get<PostEmojisService>(PostEmojisService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
