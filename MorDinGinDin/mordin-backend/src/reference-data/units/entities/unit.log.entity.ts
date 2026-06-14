import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import {
  Column,
  Entity,
  PrimaryColumn,
  Unique,
} from 'typeorm';

@Entity('units_logs')
@Unique('unique_name_log', ['name'])
export class UnitLog extends BaseLogEntity {
  @PrimaryColumn()
  unitId: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'initial', type: 'varchar', length: 10, nullable: false })
  initial: string;

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;

}
