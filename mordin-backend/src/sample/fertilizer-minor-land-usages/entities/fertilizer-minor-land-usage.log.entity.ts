import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('fertilizer_minor_land_usages_logs')
export class FertilizerMinorLandUsageLog extends BaseLogEntity {
  @PrimaryColumn()
  fertilizerMinorLandUsageId: number;

  @Column({ name: 'service_fertilizer_minor_id' })
  serviceFertilizerMinorId: number;

  @Column({ name: 'book_id' })
  bookId: number;

  @Column({ name: 'result_id' })
  resultId: number;

  @Column({ name: 'level', type: 'int' })
  level: number;

  @Column({ name: 'fertilizer_minor_id' })
  fertilizerMinorId: number;

  @Column({ name: 'result_value', type: 'float', nullable: true })
  resultValue: number;

  @Column({
    name: 'fertilizer_minor_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  fertilizerMinorName: string;

  @Column({ name: 'use_rate_per_rai', type: 'float', nullable: true })
  useRatePerRai: number;

  @Column({ name: 'total_usage', type: 'float', nullable: true })
  totalUsage: number;

  @Column({ name: 'price_per_rai', type: 'float', nullable: true })
  pricePerRai: number;

  @Column({ name: 'total_price', type: 'float', nullable: true })
  totalPrice: number;

  @Column({ name: 'updated_uid' })
  updatedUid: number;
}
