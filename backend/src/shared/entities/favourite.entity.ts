import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

/** ふぁぼ */
@Entity('favourites')
export class FavouriteEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;
  
  /** ふぁぼられた投稿のユーザ ID */
  @Column({ name: 'favourited_posts_user_id' })
  public favouritedPostsUserId: string;
  
  /** ふぁぼられた投稿の ID */
  @Column({ name: 'favourited_post_id' })
  public favouritedPostId: string;
  
  /** 対象の投稿をふぁぼったユーザ ID */
  @Column({ name: 'user_id' })
  public userId: string;
  
  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date;
  
  /** ふぁぼったユーザ : ユーザが対象の投稿に対してふぁぼを行ったことを示す・ユーザ削除時に本ふぁぼ情報も同時に削除される */
  @ManyToOne(() => UserEntity, userEntity => userEntity.id, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })  // 本 `favourites.user_id` が `users.id` の Foreign Key であることを示す
  public favouritedByUser: UserEntity;
  
  /** 投稿に対するふぁぼの数をまとめる・投稿削除時に本ふぁぼ情報も同時に削除される */
  @ManyToOne(() => PostEntity, postEntity => postEntity.favourites, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'favourited_post_id', referencedColumnName: 'id' })  // 本 `favourites.favourited_post_id` が `posts.id` の Foreign Key であることを示す
  public post: PostEntity;
  
  constructor(partial: Partial<FavouriteEntity>) { Object.assign(this, partial); }
}
