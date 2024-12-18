import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IntroductionEntity } from '../../../shared/entities/introduction.entity';

import type { Result } from '../../../common/types/result';

/** Introductions Service */
@Injectable()
export class IntroductionsService {
  private readonly logger: Logger = new Logger(IntroductionsService.name);
  
  constructor(@InjectRepository(IntroductionEntity) private readonly introductionsRepository: Repository<IntroductionEntity>) { }
  
  /** 指定ユーザの承認されている紹介一覧を取得する */
  public async findAllApproved(recipientUserId: string): Promise<Result<Array<IntroductionEntity>>> {
    try {
      const introductions = await this.introductionsRepository.findBy({ recipientUserId, isApproved: true });
      return { result: introductions };
    }
    catch(error) {
      this.logger.error('承認されている紹介一覧の取得に失敗', error);
      return { error: '承認されている紹介一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 未承認の紹介一覧を取得する */
  public async findAllUnapproved(recipientUserId: string): Promise<Result<Array<IntroductionEntity>>> {
    try {
      const introductions = await this.introductionsRepository.findBy({ recipientUserId, isApproved: false });
      return { result: introductions };
    }
    catch(error) {
      this.logger.error('未承認の紹介一覧の取得に失敗', error);
      return { error: '未承認の紹介一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 紹介文を書く */
  public async createOrUpdate(recipientUserId: string, actorUserId: string, text: string): Promise<Result<IntroductionEntity>> {
    try {
      const previousIntroductionEntity = await this.introductionsRepository.findOneBy({ recipientUserId, actorUserId });
      if(previousIntroductionEntity == null) {
        const newIntroductionEntity = new IntroductionEntity({
          recipientUserId,
          actorUserId,
          text,
          isApproved: false
        });
        const createdIntroductionEntity = await this.introductionsRepository.save(newIntroductionEntity);
        return { result: createdIntroductionEntity };
      }
      else {
        previousIntroductionEntity.text       = text;
        previousIntroductionEntity.isApproved = false;
        const updatedIntroductionEntity = await this.introductionsRepository.save(previousIntroductionEntity);
        return { result: updatedIntroductionEntity };
      }
    }
    catch(error) {
      this.logger.error('紹介文の投稿に失敗', error);
      return { error: '紹介文の投稿に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 紹介文を承認する */
  public async approve(recipientUserId: string, actorUserId: string): Promise<Result<IntroductionEntity>> {
    try {
      const introductionEntity = await this.introductionsRepository.findOneBy({ recipientUserId, actorUserId });
      if(introductionEntity == null) return { error: '紹介文が見つかりません', code: HttpStatus.BAD_REQUEST };
      
      introductionEntity.isApproved = true;
      const updatedIntroductionEntity = await this.introductionsRepository.save(introductionEntity);
      return { result: updatedIntroductionEntity };
    }
    catch(error) {
      this.logger.error('紹介文の承認に失敗', error);
      return { error: '紹介文の承認に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 紹介文を却下する・承認済み紹介文を削除する */
  public async remove(recipientUserId: string, actorUserId: string): Promise<Result<boolean>> {
    try {
      const deleteResult = await this.introductionsRepository.delete({ recipientUserId, actorUserId });
      if(deleteResult.affected !== 1) {
        this.logger.error('紹介文の削除処理で0件 or 2件以上の削除が発生', deleteResult);
        return { error: '紹介文の削除処理で問題が発生', code: HttpStatus.INTERNAL_SERVER_ERROR };
      }
      return { result: true };
    }
    catch(error) {
      this.logger.error('紹介文の削除処理に失敗', error);
      return { error: '紹介文の削除処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
