import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { PollOptionEntity } from './poll-option.entity';
import { PollEntity } from './poll.entity';

/** アンケートの選択肢に対する回答 */
@Entity('poll_votes')
@Unique(['pollId', 'userId'])  // 1つのアンケートにつき一人1回の回答のみ
export class PollVoteEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;
  
  @Column({ name: 'poll_id' })
  public pollId: number;
  
  @Column({ name: 'poll_option_id' })
  public pollOptionId: number;
  
  @Column({ name: 'user_id' })
  public userId: string;
  
  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date;
  
  /** アンケートとの親子関係を示す */
  @ManyToOne(() => PollEntity, pollEntity => pollEntity.pollVotes, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id', referencedColumnName: 'id' })
  public poll: PollEntity;
  
  /** 選択肢との親子関係を示す */
  @ManyToOne(() => PollOptionEntity, pollOptionEntity => pollOptionEntity.pollVotes, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_option_id', referencedColumnName: 'id' })
  public pollOption: PollOptionEntity;
  
  constructor(partial: Partial<PollVoteEntity>) { Object.assign(this, partial); }
}
