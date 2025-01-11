import { Repository } from 'typeorm';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { NotificationEntity } from '../../shared/entities/notification.entity';

import type { Result } from '../../common/types/result';

/** Notifications Service */
@Injectable()
export class NotificationsService {
  /** 1ユーザにつき残す通知履歴の最大件数 */
  private readonly maxNotificationsPerUser: number = 50;
  /** 1ユーザにつき残す通知履歴の日数 */
  private readonly daysToKeep: number = 30;
  
  private readonly logger: Logger = new Logger(NotificationsService.name);
  
  constructor(@InjectRepository(NotificationEntity) private readonly notificationsRepository: Repository<NotificationEntity>) { }
  
  /** 通知一覧を取得する */
  public async findAll(userId: string): Promise<Result<Array<NotificationEntity>>> {
    try {
      const notifications = await this.notificationsRepository.find({
        select: {
          id              : true,
          notificationType: true,
          message         : true,
          actorUserId     : true,
          postId          : true,
          emojiId         : true,
          isRead          : true,
          createdAt       : true,
          actorUser: {  // 通知の送信者情報を一緒に返す
            id       : true,
            name     : true,
            avatarUrl: true
          },
          emoji: {
            id      : true,
            name    : true,
            imageUrl: true
          }
        },
        where: { recipientUserId: userId },
        relations: ['actorUser', 'emoji'],
        order: { id: 'DESC' }
      });
      return { result: notifications };
    }
    catch(error) {
      this.logger.error('通知一覧の取得に失敗', error);
      return { error: '通知一覧の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 未読件数を取得する */
  public async getNumberOfUnreads(userId: string): Promise<Result<number>> {
    try {
      const numberOfUnreads = await this.notificationsRepository.count({
        where: {
          recipientUserId: userId,
          isRead         : false
        }
      });
      return { result: numberOfUnreads };
    }
    catch(error) {
      this.logger.error('未読件数の取得に失敗', error);
      return { error: '未読件数の取得に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 通知を作成する */
  public async create(notificationEntity: NotificationEntity): Promise<Result<boolean>> {
    try {
      await this.notificationsRepository.insert(notificationEntity);
    }
    catch(error) {
      this.logger.error('通知登録処理に失敗', error);
      return { error: '通知登録処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
    
    // 通知を受信するユーザについて古い通知を削除する (エラーは無視する)
    await this.removeMaxNotifications(notificationEntity.recipientUserId);
    await this.removeOldNotifications(notificationEntity.recipientUserId);
    
    return { result: true };
  }
  
  /** 通知を全て既読にする */
  public async readAll(userId: string): Promise<Result<boolean>> {
    try {
      await this.notificationsRepository.update({ recipientUserId: userId }, { isRead: true });
      return { result: true };
    }
    catch(error) {
      this.logger.error('通知の既読処理に失敗', error);
      return { error: '通知の既読処理に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 最大件数を超えた通知履歴を削除する */
  private async removeMaxNotifications(userId: string): Promise<Result<boolean>> {
    try {
      const oldRecords = await this.notificationsRepository
        .createQueryBuilder('notifications')
        .where('recipient_user_id = :userId', { userId })
        .orderBy('created_at', 'DESC')
        .skip(this.maxNotificationsPerUser) // 最新の指定件数は除外する
        .getMany();
      if(oldRecords.length > 0) {
        for await (const oldRecord of oldRecords) {
          await this.notificationsRepository.delete({ id: oldRecord.id });
        }
      }
      this.logger.debug(`最大件数を超えた通知履歴を削除 [User ID @${userId}] [削除件数 ${oldRecords.length}]`);
      return { result: true };
    }
    catch(error) {
      this.logger.error('最大件数を超えた通知履歴の削除に失敗', error);
      return { error: '最大履歴を超えた通知履歴の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
  
  /** 保持期間を過ぎた通知履歴を削除する */
  private async removeOldNotifications(userId: string): Promise<Result<boolean>> {
    try {
      const deleteResult = await this.notificationsRepository
        .createQueryBuilder('notifications')
        .delete()
        .where('recipient_user_id = :userId', { userId })
        .andWhere('created_at < :date', { date: new Date(Date.now() - this.daysToKeep * 24 * 60 * 60 * 1000) })
        .execute();
      this.logger.debug(`保持期間を過ぎた通知履歴を削除 [User ID @${userId}] [削除件数 ${deleteResult.affected}]`);
      return { result: true };
    }
    catch(error) {
      this.logger.error('保持期間を過ぎた通知履歴の削除に失敗', error);
      return { error: '保持期間を過ぎた通知履歴の削除に失敗', code: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
