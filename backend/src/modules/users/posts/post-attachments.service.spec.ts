import { NestMinioService } from 'nestjs-minio';
import { Repository } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AttachmentEntity } from '../../../shared/entities/attachment.entity';
import { EmojisService } from '../../emojis/emojis.service';
import { PostAttachmentsService } from './post-attachments.service';

describe('PostAttachmentsService', () => {
  let service: PostAttachmentsService;
  let fakeAttachmentService: Partial<Repository<AttachmentEntity>>;
  let fakeNestMinioService: Partial<NestMinioService>;
  let fakeEmojisService: Partial<EmojisService>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostAttachmentsService,
        { provide: getRepositoryToken(AttachmentEntity), useValue: fakeAttachmentService },
        { provide: NestMinioService, useValue: fakeNestMinioService },
        { provide: EmojisService, useValue: fakeEmojisService }
      ]
    }).compile();
    
    service = module.get<PostAttachmentsService>(PostAttachmentsService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
