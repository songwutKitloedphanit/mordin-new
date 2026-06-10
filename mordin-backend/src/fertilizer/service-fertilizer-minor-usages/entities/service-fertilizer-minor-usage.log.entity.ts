import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('service_fertilizer_minor_usages_logs')
// @Unique('unique_service_fertilizer_minor_usage', ['serviceFertilizerMinorId', 'level'])
export class ServiceFertilizerMinorUsageLog extends BaseLogEntity {
  // @PrimaryColumn()
  // serviceFertilizerMinorUsageId: number;

  @PrimaryColumn({ name: 'service_fertilizer_minor_id' })
  serviceFertilizerMinorId: number;

  @PrimaryColumn({ name: 'level', type: 'int' })
  level: number;

  @Column({ name: 'cutoff_value', type: 'float' })
  cutoffValue: number;

  @Column({ name: 'cutoff_text', type: 'varchar', length: 100 })
  cutoffText: string;

  @Column({ name: 'fertilizer_usage_value', type: 'float' })
  fertilizerUsageValue: number;

  @Column({ name: 'update_uid' })
  updateUid: number;
}
