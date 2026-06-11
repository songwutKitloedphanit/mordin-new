import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserRoles } from '../enums/user.enum';

import { Department } from './department.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'username', type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: false })
  lastName: string;

  @Column({ name: 'email', type: 'varchar', length: 100, nullable: false })
  email: string;

  @Column({ name: 'role', enum: UserRoles, nullable: false })
  role: UserRoles;

  @Column({ name: 'department_id', nullable: false })
  departmentId: number;

  @Column({ name: 'update_uid', nullable: true })
  updateUid: number;

  @Column({ name: 'updated_at', type: 'bigint', nullable: false })
  updatedAt: number;

  removedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_uid' })
  updateUser: User;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
