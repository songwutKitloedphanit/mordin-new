import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import {
  Column,
  Entity,
  PrimaryColumn,
  Unique,
} from 'typeorm';

@Entity('laboratories_logs')
export class LaboratoryLog extends BaseLogEntity {
  @PrimaryColumn()
  laboratoryId: number;

  @Column({ name: 'laboratory_code', type: 'varchar', length: 45 })
  laboratoryCode: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'short_name_before', type: 'varchar', length: 30 })
  shortNameBefore: string;

  @Column({ name: 'unit_before', type: 'varchar', length: 30 })
  unitBefore: string;

  @Column({ name: 'short_name_after', type: 'varchar', length: 30 })
  shortNameAfter: string;

  @Column({ name: 'unit_after', type: 'varchar', length: 30 })
  unitAfter: string;

  @Column({ name: 'range_min', type: 'float' })
  rangeMin: number;

  @Column({ name: 'range_max', type: 'float' })
  rangeMax: number;

  @Column({ name: 'machine_type_id' })
  machineTypeId: number;

  @Column({ name: 'is_main', type: 'bool', default: false })

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;

}
