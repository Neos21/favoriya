import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  public readonly id: number;
  
  @Column({ name: 'user_id', unique: true })
  public userId: string;
  
  @Column({ name: 'password_hash' })
  public passwordHash: string;
  
  @Column({ name: 'name', nullable: true })
  public name: string;
  
  @Column({ name: 'role' })
  public role: string;
  
  @CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at' })
  public readonly updatedAt: Date;
  
  constructor(partial: Partial<UserEntity>) { Object.assign(this, partial); }
}
