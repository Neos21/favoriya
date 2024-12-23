import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { EmojiReactionEntity } from './emoji-reaction.entity';
import { FavouriteEntity } from './favourite.entity';
import { TopicEntity } from './topic.entity';
import { UserEntity } from './user.entity';

/** 投稿 */
@Entity('posts')
export class PostEntity {
  @PrimaryColumn({ name: 'id', type: 'bigint', unique: true })
  public id: string;  // bigint に対応する型として string を使用する
  
  @Column({ name: 'user_id' })
  public userId: string;
  
  @Column({ name: 'text' })
  public text: string;
  
  @Column({ name: 'topic_id', nullable: true })
  public topicId: number;
  
  /** 公開範囲 : 未指定ならグローバルタイムラインに載る・'home' ならホームタイムラインには載る */
  @Column({ name: 'visibility', nullable: true })
  public visibility: string;
  
  /** 返信元の ID */
  @Column({ name: 'in_reply_to_post_id', type: 'bigint', nullable: true })
  public inReplyToPostId: string;
  
  /** 返信元のユーザ ID */
  @Column({ name: 'in_reply_to_user_id', nullable: true })
  public inReplyToUserId: string;
  
  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt: Date;
  
  /** ユーザ (親) との親子関係を示す (カラムは作られない) */
  @ManyToOne(() => UserEntity, userEntity => userEntity.posts, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })  // 本 `posts.user_id` が `users.id` (親) の Foreign Key であることを示す
  public user: UserEntity;
  
  /** この投稿がふぁぼられた情報との関係を示す */
  @OneToMany(() => FavouriteEntity, favouriteEntity => favouriteEntity.post, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })  // この onDelete は、親である Post が消された時に子である Favourite を消したいという意思を表現しているだけ、DB 制約としては Favourite 側の ManyToOne に書かないと効果がない
  public favourites: Array<FavouriteEntity>;
  
  /** この投稿に対する絵文字リアクションとの関係を示す */
  @OneToMany(() => EmojiReactionEntity, emojiReactionEntity => emojiReactionEntity.post, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  public emojiReactions: Array<EmojiReactionEntity>;
  
  /** この投稿のトピック */
  @ManyToOne(() => TopicEntity, topicEntity => topicEntity.posts, { eager: true, createForeignKeyConstraints: false })  // eager によって紐付いて取得される
  @JoinColumn({ name: 'topic_id', referencedColumnName: 'id' })
  public topic: TopicEntity;
  
  constructor(partial: Partial<PostEntity>) { Object.assign(this, partial); }
  
  /** Insert 前に行われる処理 */
  @BeforeInsert()
  public generateId() {
    this.id = Date.now().toString();  // UNIX エポック秒 (ミリ秒)
  }
}
