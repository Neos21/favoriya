import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { EmojiEntity } from './emoji.entity';
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

/** 投稿に対する絵文字リアクション */
@Entity('emoji_reactions')
@Unique(['reactedPostsUserId', 'reactedPostId', 'userId', 'emojiId'])  // 一つの投稿に、同じユーザが同じ絵文字リアクションを打てないようにする
export class EmojiReactionEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;
  
  /** 絵文字リアクションされた投稿のユーザ ID */
  @Column({ name: 'reacted_posts_user_id' })
  public reactedPostsUserId: string;
  
  /** 絵文字リアクションされた投稿の ID */
  @Column({ name: 'reacted_post_id' })
  public reactedPostId: string;
  
  /** 対象の投稿にリアクションしたユーザ ID */
  @Column({ name: 'user_id' })
  public userId: string;
  
  /** 対象の投稿に打った絵文字リアクション ID */
  @Column({ name: 'emoji_id' })
  public emojiId: number;
  
  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date;
  
  /** 絵文字リアクションを打ったユーザ */
  @ManyToOne(() => UserEntity, userEntity => userEntity.id, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public reactionByUser: UserEntity;
  
  /** 絵文字リアクションを打った投稿 */
  @ManyToOne(() => PostEntity, postEntity => postEntity.emojiReactions, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reacted_post_id', referencedColumnName: 'id' })
  public post: PostEntity;
  
  /** 利用している絵文字リアクション定義 */
  @ManyToOne(() => EmojiEntity, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'emoji_id' })
  public emoji: EmojiEntity;
  
  constructor(partial: Partial<EmojiReactionEntity>) { Object.assign(this, partial); }
}
