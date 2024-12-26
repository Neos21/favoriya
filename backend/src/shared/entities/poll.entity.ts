import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { PollOptionEntity } from './poll-option.entity';
import { PollVoteEntity } from './poll-vote.entity';
import { PostEntity } from './post.entity';

/** 投稿に紐付くアンケート */
@Entity('polls')
@Unique(['userId', 'postId'])
export class PollEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;
  
  @Column({ name: 'user_id' })
  public userId: string;
  
  @Column({ name: 'post_id' })
  public postId: string;
  
  @Column({ name: 'expires_at' })
  public expiresAt: Date;
  
  /** 投稿 (親) との親子関係を示す */
  @OneToOne(() => PostEntity, postEntity => postEntity.poll, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  public post: PostEntity;
  
  /** 選択肢 */
  @OneToMany(() => PollOptionEntity, pollOptionEntity => pollOptionEntity.poll, { createForeignKeyConstraints: false, cascade: true })
  public pollOptions: Array<PollOptionEntity>;
  
  /** 選択肢に対する回答 */
  @OneToMany(() => PollVoteEntity, pollVoteEntity => pollVoteEntity.poll, { createForeignKeyConstraints: false, cascade: true })
  public pollVotes: Array<PollVoteEntity>;
  
  constructor(partial: Partial<PollEntity>) { Object.assign(this, partial); }
}
