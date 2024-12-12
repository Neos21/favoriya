import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/** ログイン履歴 */
@Entity('login_histories')
export class LoginHistoryEntity {
  @PrimaryColumn({ name: 'user_id' })
  public userId: string;
  
  /** IP アドレス */
  @PrimaryColumn({ name: 'ip' })
  public ip: string;
  
  /** User Agent */
  @PrimaryColumn({ name: 'ua' })
  public ua: string;
  
  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt: Date;
  
  constructor(partial: Partial<LoginHistoryEntity>) { Object.assign(this, partial); }
}
