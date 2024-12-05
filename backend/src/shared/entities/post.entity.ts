import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { UserEntity } from './user.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryColumn({ type: 'bigint', unique: true })
  public id: string;  // bigint に対応する型として string を使用する
  
  @Column({ name: 'user_id' })
  public userId: string;
  
  @Column({ name: 'text' })
  public text: string;
  
  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt: Date;
  
  /** y-座 (親) との親子関係を示す (カラムは作られない) */
  @ManyToOne(() => UserEntity, userEntity => userEntity.posts, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })  // 本 `posts.user_id` が `users.id` (親) の Foreign Key であることを示す
  public user: UserEntity;
  
  constructor(partial: Partial<PostEntity>) { Object.assign(this, partial); }
  
  @BeforeInsert()
  public generateId() {
    this.id = Date.now().toString();  // UNIX エポック秒 (ミリ秒)
  }
}
