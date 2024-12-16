import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PostEntity } from './post.entity';

/** 投稿のトピック */
@Entity('topics')
export class TopicEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;
  
  @Column({ name: 'name', unique: true })
  public name: string;
  
  @OneToMany(() => PostEntity, postEntity => postEntity.topic, { createForeignKeyConstraints: false })
  public posts: Array<PostEntity>;
  
  constructor(partial: Partial<TopicEntity>) { Object.assign(this, partial); }
}
