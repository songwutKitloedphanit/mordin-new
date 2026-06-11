import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('usage_types')
@Unique('unique_usage_type', ['name'])
export class UsageType {
  @PrimaryGeneratedColumn({ name: 'usage_type_id' })
  usageTypeId: number;

  @Column({ name: 'name', type: 'varchar', length: 60 })
  name: string;

  @Column({ name: 'update_uid' })
  updateUid: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_uid' })
  updateUser: User;

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
