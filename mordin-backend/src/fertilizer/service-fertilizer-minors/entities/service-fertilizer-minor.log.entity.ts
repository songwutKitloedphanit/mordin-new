import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import {
  Column,
  Entity,
  PrimaryColumn,
  Unique,
} from 'typeorm';

@Entity('service_fertilizer_minors_logs')
export class ServiceFertilizerMinorLog extends BaseLogEntity {
  @PrimaryColumn()
  serviceFertilizerMinorId: number;

  @Column({ name: 'service_type_id' })
  serviceTypeId: number;

  @Column({ name: 'fertilizer_minor_id' })
  fertilizerMinorId: number;

  @Column({ name: 'laboratory_id', nullable: true })
  laboratoryId: number;

  @Column({ name: 'unit_id' })
  unitId: number;

  @Column({ name: 'update_uid' })
  updateUid: number;
}
