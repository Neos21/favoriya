import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IntroductionEntity } from '../../../shared/entities/introduction.entity';
import { NotificationEntity } from '../../../shared/entities/notification.entity';
import { NotificationsService } from '../../notifications/notifications.service';

import type { Result } from '../../../common/types/result';

/** Introductions Service */
@Injectable()
export class IntroductionsService {
  private readonly logger: Logger = new Logger(IntroductionsService.name);
  
  constructor(
    @InjectRepository(IntroductionEntity) private readonly introductionsRepository: Repository<IntroductionEntity>,
    private readonly notificationsService: NotificationsService
  ) { }
  
  /** 指定ユーザの承認されている紹介一覧を取得する */
  public async findAllApproved(recipientUserId: string): Promise<Result<Array<IntroductionEntity>>> {
    try {
      const introductions = await this.introductionsRepository.find({
        select: {
          actorUser: {  // 紹介者の情報を紐付けて取得する
            id       : true,
            name     : true,
            avatarUrl: true
          }
        },
        relations: ['actorUser'],
        where: { recipientUserId, isApproved: true }
      });
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
      const introductions = await this.introductionsRepository.find({
        select: {
          actorUser: {  // 紹介者の情報を紐付けて取得する
            id       : true,
            name     : true,
            avatarUrl: true
          }
        },
        relations: ['actorUser'],
        where: { recipientUserId, isApproved: false }
      });
      return { result: introductions };
    }
    catch(error) {
      this.logger.error('未承認の紹介一覧の取得に失敗', error);
      return { error: '未承認の紹介一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 紹介1件を取得する */
  public async findOne(recipientUserId: string, actorUserId: string): Promise<Result<IntroductionEntity>> {
    if(recipientUserId === actorUserId) return { error: '紹介者と被紹介者が同じです', code: HttpStatus.BAD_REQUEST };
    try {
      const introduction = await this.introductionsRepository.findOneBy({ recipientUserId, actorUserId });
      if(introduction == null) return { error: '紹介情報が見つかりませんでした', code: HttpStatus.NOT_FOUND };
      
      return { result: introduction };
    }
    catch(error) {
      this.logger.error('紹介情報の取得に失敗', error);
      return { error: '紹介情報の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 紹介文を書く */
  public async createOrUpdate(recipientUserId: string, actorUserId: string, text: string): Promise<Result<IntroductionEntity>> {
    if(recipientUserId === actorUserId) return { error: '紹介者と被紹介者が同じです', code: HttpStatus.BAD_REQUEST };
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
        
        // 通知を飛ばす
        await this.notificationsService.create(new NotificationEntity({
          notificationType: 'introduction',
          message         : `相互フォロワーの @${actorUserId} さんがあなたの紹介文を書きました。確認して承認してください`,
          isRead          : false,
          recipientUserId,
          actorUserId
        }));
        
        return { result: createdIntroductionEntity };
      }
      else {
        previousIntroductionEntity.text       = text;
        previousIntroductionEntity.isApproved = false;
        const updatedIntroductionEntity = await this.introductionsRepository.save(previousIntroductionEntity);
        
        // 通知を飛ばす
        await this.notificationsService.create(new NotificationEntity({
          notificationType: 'introduction',
          message         : `相互フォロワーの @${actorUserId} さんがあなたの紹介文を更新しました。確認して承認してください`,
          isRead          : false,
          recipientUserId,
          actorUserId
        }));
        
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
    if(recipientUserId === actorUserId) return { error: '紹介者と被紹介者が同じです', code: HttpStatus.BAD_REQUEST };
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
    if(recipientUserId === actorUserId) return { error: '紹介者と被紹介者が同じです', code: HttpStatus.BAD_REQUEST };
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
