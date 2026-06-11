import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('standards_logs')
export class StandardLog extends BaseLogEntity {
  @PrimaryColumn()
  standardId: number;

  @Column({ name: 'standard_name', type: 'varchar', length: 255 })
  standardName: string;

  @Column({ name: 'updated_uid' })
  updatedUid: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;
}
