import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('usage_types_logs')
@Unique('unique_usage_type_log', ['name'])
export class UsageTypeLog extends BaseLogEntity {
  @PrimaryColumn()
  usageTypeId: number;

  @Column({ name: 'name', type: 'varchar', length: 60 })
  name: string;

  @Column({ name: 'update_uid' })
  updateUid: number;
}
