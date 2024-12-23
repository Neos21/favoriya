import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** 絵文字リアクション定義 */
@Entity('emojis')
export class EmojiEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;
  
  @Column({ name: 'name', unique: true })
  public name: string;
  
  @Column({ name: 'image_url' })
  public imageUrl: string;
  
  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date;
  
  constructor(partial: Partial<EmojiEntity>) { Object.assign(this, partial); }
}
