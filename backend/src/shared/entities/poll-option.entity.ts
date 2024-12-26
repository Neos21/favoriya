import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PollVoteEntity } from './poll-vote.entity';
import { PollEntity } from './poll.entity';

/** アンケートの選択肢 */
@Entity('poll_options')
export class PollOptionEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;
  
  @Column({ name: 'poll_id' })
  public pollId: number;
  
  /** 選択肢のテキスト */
  @Column({ name: 'text' })
  public text: string;
  
  /** アンケート (親) との親子関係を示す */
  @ManyToOne(() => PollEntity, pollEntity => pollEntity.pollOptions, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id', referencedColumnName: 'id' })
  public poll: PollEntity;
  
  /** 選択肢に対する回答 */
  @OneToMany(() => PollVoteEntity, pollVoteEntity => pollVoteEntity.pollOption, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  public pollVotes: Array<PollVoteEntity>;
  
  constructor(partial: Partial<PollOptionEntity>) { Object.assign(this, partial); }
}
