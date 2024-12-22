import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from './user.entity';

/** 通知 */
@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;
  
  /** 'favourite' | 'follow' | 'introduction' | 'reply' など通知の種類 */
  @Column({ name: 'notification_type' })
  public notificationType: string;
  
  /** 表示用の通知メッセージ */
  @Column({ name: 'message' })
  public message: string;
  
  /** 受信者のユーザ ID */
  @Column({ name: 'recipient_user_id' })
  public recipientUserId: string;
  
  /** 通知をトリガーしたユーザの ID */
  @Column({ name: 'actor_user_id' })
  public actorUserId: string;
  
  /** 関連する投稿 ID (お気に入り・リプライの場合) */
  @Column({ name: 'post_id', nullable: true })
  public postId: string;
  
  /** 既読か否か */
  @Column({ name: 'is_read', default: false })
  public isRead: boolean;
  
  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date;
  
  /** 通知の受信者 */
  @ManyToOne(() => UserEntity, userEntity => userEntity.recipientNotifications, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_user_id', referencedColumnName: 'id' })
  public recipientUser: UserEntity;
  
  /** 通知の送信者 */
  @ManyToOne(() => UserEntity, userEntity => userEntity.actorNotifications, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_user_id', referencedColumnName: 'id' })
  public actorUser: UserEntity;
  
  constructor(partial: Partial<NotificationEntity>) { Object.assign(this, partial); }
}
