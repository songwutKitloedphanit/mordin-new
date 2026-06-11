import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

export enum StandardType {
  CRM = 'crm',
  BLANK = 'blank',
}

@Entity('analysis_standards_logs')
@Unique('unique_analysis_standard_logs', [
  'serviceCalendarId',
  'standardId',
  'name',
])
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
