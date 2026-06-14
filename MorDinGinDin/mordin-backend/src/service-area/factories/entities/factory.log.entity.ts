import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { ServiceArea } from 'src/service-area/service-areas/entities/service-area.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('factories_logs')
@Unique(['initial'])
export class FactoryLog extends BaseLogEntity{
  @PrimaryColumn()
  factoryId: number;

  // @Column({ name: 'code', type: 'varchar', length: 10})
  // code: string;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'initial', type: 'varchar', length: 4 })
  initial: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;

}
