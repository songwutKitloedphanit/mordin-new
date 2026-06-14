import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

// History table: no UNIQUE business-key constraint (see analysis-standard.log.entity).
@Entity('units_logs')
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
