import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { FertilizerMajorTypes } from 'src/fertilizer/enums/fertilizer.enum';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('fertilizer_majors_logs')
export class FertilizerMajorLog extends BaseLogEntity {
  @PrimaryColumn()
  fertilizerMajorId: number;

  @Column({ name: 'type', enum: FertilizerMajorTypes })
  type: FertilizerMajorTypes;

  @Column({ name: 'formular', type: 'varchar', length: 8 })
  formular: string;

  @Column({ name: 'N', type: 'int' })
  N: number;

  @Column({ name: 'P', type: 'int' })
  P: number;

  @Column({ name: 'K', type: 'int' })
  K: number;

  @Column({ name: 'quantity', type: 'float' })
  quantity: number;

  @Column({ name: 'unit_id' })
  unitId: number;

  @Column({ name: 'price', type: 'float' })
  price: number;

  @Column({ name: 'price_per_unit', type: 'float' })
  pricePerUnit: number;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string;

  //add update user id
  @Column({ name: 'update_uid', type: 'int', nullable: true })
  updateUid: number;
}
