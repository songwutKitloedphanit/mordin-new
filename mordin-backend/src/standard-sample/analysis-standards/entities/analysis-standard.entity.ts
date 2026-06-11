import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { AnalysisStandardResult } from 'src/standard-sample/analysis-standard-results/entities/analysis-standard-result.entity';
import { Standard } from 'src/standard-sample/standards/entities/standard.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum StandardType {
  CRM = 'crm',
  BLANK = 'blank',
}

@Entity('analysis_standards')
@Unique('unique_analysis_standard', ['serviceCalendarId', 'standardId', 'name'])
export class AnalysisStandard {
  @PrimaryGeneratedColumn({ name: 'analysis_standard_id' })
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

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @ManyToOne(() => ServiceCalendar, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_calendar_id' })
  serviceCalendar: ServiceCalendar;

  @ManyToOne(() => Standard, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'standard_id' })
  standard: Standard;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'update_uid' })
  updatedUser: User;

  @OneToMany(() => AnalysisStandardResult, result => result.analysisStandard, {
    cascade: true,
  })
  analysisStandardResults: AnalysisStandardResult[];

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
