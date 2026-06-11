import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum SampleBlankType {
  SAMPLE = 'sample',
  BLANK = 'blank',
}

@Entity('sample_blanks_logs')
export class SampleBlankLog extends BaseLogEntity {
  @PrimaryColumn({ name: 'sample_blank_id' })
  sampleBlankId: number;

  @Column({ name: 'service_calendar_id', type: 'int' })
  serviceCalendarId: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'repeatCount', type: 'int' })
  repeatCount: number;

  @Column({ name: 'type', type: 'enum', enum: SampleBlankType })
  type: SampleBlankType;

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;
}
