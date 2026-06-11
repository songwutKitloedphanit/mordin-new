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

@Entity('units')
@Unique('unique_name', ['name'])
export class Unit {
  @PrimaryGeneratedColumn({ name: 'unit_id' })
  unitId: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'initial', type: 'varchar', length: 10, nullable: false })
  initial: string;

  @Column({ name: 'update_uid', type: 'int' })
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
