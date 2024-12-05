import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { PostEntity } from './post.entity';

@Entity('users')
export class UserEntity {
  @PrimaryColumn({ name: 'id', unique: true })
  public id: string;
  
  @Column({ name: 'password_hash' })
  public passwordHash: string;
  
  @Column({ name: 'name', nullable: true })
  public name: string;
  
  @Column({ name: 'role' })
  public role: string;
  
  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt: Date;
  
  /** 投稿情報 (子) との親子関係を示す (カラムは作られない) : `@ManyToOne` を指定したプロパティと相互紐付けする */
  @OneToMany(() => PostEntity, postEntity => postEntity.user, { createForeignKeyConstraints: false })
  public posts: Array<PostEntity>;
  
  constructor(partial: Partial<UserEntity>) { Object.assign(this, partial); }
}
