import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { FollowEntity } from './follow.entity';
import { PostEntity } from './post.entity';

/** ユーザ情報 */
@Entity('users')
export class UserEntity {
  @PrimaryColumn({ name: 'id', unique: true })
  public id: string;
  
  @Column({ name: 'password_hash' })
  public passwordHash: string;
  
  @Column({ name: 'name', default: '名無し' })
  public name: string;
  
  @Column({ name: 'role', default: 'Normal' })
  public role: string;
  
  @Column({ name: 'avatar_url', nullable: true })
  public avatarUrl: string;
  
  @Column({ name: 'profile_text', nullable: true })
  public profileText: string;
  
  /** 自分自身の投稿のふぁぼ数を見えるようにするか否か */
  @Column({ name: 'show_own_favourites_count', default: true })
  public showOwnFavouritesCount: boolean;
  
  /** 他人の投稿のふぁぼ数を見えるようにするか否か */
  @Column({ name: 'show_others_favourites_count', default: true })
  public showOthersFavouritesCount: boolean;
  
  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt: Date;
  
  /** 投稿情報 (子) との親子関係を示す (カラムは作られない) : `@ManyToOne` を指定したプロパティと相互紐付けする */
  @OneToMany(() => PostEntity, postEntity => postEntity.user, { createForeignKeyConstraints: false })
  public posts: Array<PostEntity>;
  
  /** 自身のことをフォローしているフォロワーたち */
  @OneToMany(() => FollowEntity, followEntity => followEntity.follower, { createForeignKeyConstraints: false })
  public followers: Array<FollowEntity>;
  
  /** 自身がフォローしている人たち */
  @OneToMany(() => FollowEntity, followEntity => followEntity.following)
  public followings: Array<FollowEntity>;
  
  constructor(partial: Partial<UserEntity>) { Object.assign(this, partial); }
}
