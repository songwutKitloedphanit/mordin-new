import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('fertilizer_minors_logs')
export class FertilizerMinorLog extends BaseLogEntity {
  @PrimaryColumn()
  fertilizerMinorId: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'price_per_unit', type: 'float' })
  pricePerUnit: number;

  @Column({ name: 'unit_id' })
  unitId: number;

  @Column({ name: 'benefit', type: 'text', nullable: false })
  benefit: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;
}
