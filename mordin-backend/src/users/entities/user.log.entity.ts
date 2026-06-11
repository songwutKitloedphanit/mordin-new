import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

import { UserRoles } from '../enums/user.enum';

@Entity('users_logs')
export class UserLog extends BaseLogEntity {
  @PrimaryColumn()
  userId: number;

  @Column({ name: 'username', type: 'varchar', length: 100 })
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
}
