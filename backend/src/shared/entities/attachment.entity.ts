import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { PostEntity } from './post.entity';

/** 投稿に紐付く添付ファイル */
@Entity('attachments')
@Unique(['userId', 'postId'])
export class AttachmentEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;
  
  @Column({ name: 'user_id' })
  public userId: string;
  
  @Column({ name: 'post_id' })
  public postId: string;
  
  /** ファイルの保存パス */
  @Column({ name: 'file_path' })
  public filePath: string;
  
  @Column({ name: 'mime_type' })
  public mimeType: string;
  
  /** 投稿 (親) との親子関係を示す */
  @OneToOne(() => PostEntity, postEntity => postEntity.attachment, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  public post: PostEntity;
  
  constructor(partial: Partial<AttachmentEntity>) { Object.assign(this, partial); }
}
