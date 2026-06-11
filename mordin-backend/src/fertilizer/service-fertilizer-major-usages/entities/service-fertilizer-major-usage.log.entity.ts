import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('service_fertilizer_major_usages_logs')
export class ServiceFertilizerMajorUsageLog extends BaseLogEntity {
  @PrimaryColumn()
  serviceFertilizerMajorUsageId: number;

  @Column({ name: 'service_category_id', type: 'int', nullable: false })
  serviceCategoryId: number;

  @Column({ name: 'usage_type_id' })
  usageTypeId: number;

  @Column({ name: 'soil_grade_level_id' })
  soilGradeLevelId: number;

  @Column({ name: 'fertilizer_major_id', nullable: true })
  fertilizerMajorId: number;

  @Column({
    name: 'volume',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  volume: number;

  @Column({ name: 'update_uid' })
  updateUid: number;
}
