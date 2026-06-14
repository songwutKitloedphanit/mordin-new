import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum StandardType {
  CRM = 'crm',
  BLANK = 'blank',
}

// NOTE: history tables must NOT carry the main table's UNIQUE business-key
// constraint — they store one row per create/update/delete event, so the same
// (serviceCalendarId, standardId, name) tuple legitimately repeats over time.
@Entity('analysis_standards_logs')
export class AnalysisStandardLog extends BaseLogEntity {
  @PrimaryColumn()
  analysisStandardId: number;

  @Column({ name: 'service_calendar_id', type: 'int' })
  serviceCalendarId: number;

  @Column({ name: 'standard_id', type: 'int', nullable: true })
  standardId: number;

  @Column({ name: 'blank_name', type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ name: 'repeat_count', type: 'int' })
  repeatCount: number;

  @Column({ name: 'type', type: 'enum', enum: StandardType })
  type: StandardType;

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;
}
