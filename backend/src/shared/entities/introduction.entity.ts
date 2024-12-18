import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { UserEntity } from './user.entity';

/** 相互フォロワーからの紹介 */
@Entity('introductions')
export class IntroductionEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;
  
  /** 紹介される側 */
  @Column({ name: 'recipient_user_id' })
  public recipientUserId: string;
  
  /** 紹介文を書いた人 */
  @Column({ name: 'actor_user_id' })
  public actorUserId: string;
  
  /** 紹介文 */
  @Column({ name: 'text' })
  public text: string;
  
  /** 承認したか否か : 一般公開されるのは承認したモノだけ */
  @Column({ name: 'is_approved', default: false })
  public isApproved: boolean;
  
  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt: Date;
  
  /** 紹介されたユーザの情報 */
  @ManyToOne(() => UserEntity, userEntity => userEntity.recipientIntroductions, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'recipient_user_id', referencedColumnName: 'id' })
  public recipientUser: UserEntity;
  
  /** 紹介したユーザの情報 */
  @ManyToOne(() => UserEntity, userEntity => userEntity.actorIntroductions, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'actor_user_id', referencedColumnName: 'id' })
  public actorUser: UserEntity;
  
  constructor(partial: Partial<IntroductionEntity>) { Object.assign(this, partial); }
}
