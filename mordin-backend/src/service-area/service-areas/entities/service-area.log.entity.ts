import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Factory } from 'src/service-area/factories/entities/factory.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('service_areas_logs')
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

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'effective_from', type: 'date', nullable: true })
  effectiveFrom: string | null;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo: string | null;

  @Column({
    name: 'superseded_by_service_area_id',
    type: 'int',
    nullable: true,
  })
  supersededByServiceAreaId: number | null;

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;

  @Column({ name: 'audit_event_id', type: 'uuid', nullable: true })
  auditEventId: string | null;

  @Column({ name: 'action', type: 'varchar', length: 20, nullable: true })
  action: string | null;
}
