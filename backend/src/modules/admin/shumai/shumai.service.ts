import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { Repository } from 'typeorm';

import MarkovChain from '@hideokamoto/markov-chain-tiny';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { commonTopicsConstants } from '../../../common/constants/topics-constants';
import { PostEntity } from '../../../shared/entities/post.entity';

import type { Result } from '../../../common/types/result';

/** Shumai Service */
@Injectable()
export class ShumaiService {
  private readonly logger: Logger = new Logger(ShumaiService.name);
  
  constructor(@InjectRepository(PostEntity) private readonly postsRepository: Repository<PostEntity>) { }
  
  /** ランダムに投稿文を取得する */
  public async getRandomPosts(numberOfPosts: number = 5): Promise<Result<Array<string>>> {
    try {
      const posts = await this.postsRepository
        .createQueryBuilder('posts')
        .select('posts.text')  // 本文のみ取得する
        .orderBy('RANDOM()')  // PostgreSQL のランダム関数を使用する
        .limit(numberOfPosts)  // 指定の行数だけ取得する
        .getMany();
      // HTML タグを全て除去する
      const texts = posts.map(post => DOMPurify(new JSDOM('').window).sanitize(post.text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }));
      return { result: texts };
    }
    catch(error) {
      this.logger.error('ランダムに投稿を取得する処理に失敗', error);
      return { error: 'ランダムに投稿を取得する処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** マルコフ連鎖で文章を生成する */
  public generate(text: string): Result<string> {
    const markov = new MarkovChain(text);
    const sentence = markov.makeSentence();
    return { result: sentence };
  }
  
  /** 投稿する */
  public async post(text: string): Promise<Result<boolean>> {
    try {
      const newPostEntity = new PostEntity({
        userId : 'shumai',
        text   : text,
        topicId: commonTopicsConstants.normal.id
      });
      await this.postsRepository.insert(newPostEntity);
      return { result: true };
    }
    catch(error) {
      this.logger.error('投稿処理に失敗', error);
      return { error: '投稿処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
