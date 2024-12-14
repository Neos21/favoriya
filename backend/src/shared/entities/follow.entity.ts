import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { UserEntity } from './user.entity';

/** フォロー */
@Entity('follows')
export class FollowEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;
  
  /** `following_user_id` にフォローされたユーザ ID */
  @Column({ name: 'follower_user_id' })
  public followerUserId: string;
  
  /** `follower_user_id` のことをフォローしたユーザ ID (ログインユーザ相当) */
  @Column({ name: 'following_user_id' })
  public followingUserId: string;
  
  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date;
  
  /** User 自身のことをフォローしているフォロワーたち */
  @ManyToOne(() => UserEntity, userEntity => userEntity.followings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_user_id', referencedColumnName: 'id' })
  public follower: UserEntity;
  
  /** User 自身がフォローしている人たち */
  @ManyToOne(() => UserEntity, userEntity => userEntity.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_user_id', referencedColumnName: 'id' })
  public following: UserEntity;
  
  constructor(partial: Partial<FollowEntity>) { Object.assign(this, partial); }
}
