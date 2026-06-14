import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Factory } from 'src/service-area/factories/entities/factory.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
} from 'typeorm';

@Entity('service_areas_logs')
@Unique('unique_code_factory_logs', ['code', 'factoryId'])
export class ServiceAreaLog extends BaseLogEntity{
  @PrimaryColumn()
  serviceAreaId: number;

  @Column({ name: 'factory_id', type: 'int' })
  factoryId: number;

  @Column({ name: 'code', type: 'varchar', length: 10 })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 45 })
  name: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string;

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;
}
