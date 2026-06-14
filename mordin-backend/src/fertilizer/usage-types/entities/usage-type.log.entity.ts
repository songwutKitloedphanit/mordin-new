import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

// History table: no UNIQUE business-key constraint (see analysis-standard.log.entity).
@Entity('usage_types_logs')
export class UsageTypeLog extends BaseLogEntity {
  @PrimaryColumn()
  usageTypeId: number;

  @Column({ name: 'name', type: 'varchar', length: 60 })
  name: string;

  @Column({ name: 'update_uid' })
  updateUid: number;
}
