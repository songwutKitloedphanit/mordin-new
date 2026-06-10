import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('laboratory_settings_logs')
export class LaboratorySettingLog extends BaseLogEntity {
  @PrimaryColumn()
  laboratorySettingId: number;

  @Column({ name: 'laboratory_id' })
  laboratoryId: number;

  @Column({ name: 'service_calendar_id' })
  serviceCalendarId: number;

  @Column({
    name: 'working_standard',
    type: 'float',
    nullable: true,
    default: null,
  })
  workingStandard: number;

  @Column({ name: 'r_squared', type: 'float', nullable: true, default: null })
  rSquared: number;

  @Column({
    name: 'extract_concentration',
    type: 'float',
    nullable: true,
    default: null,
  })
  extractConcentration: number;

  @Column({
    name: 'extract_amount',
    type: 'float',
    nullable: true,
    default: null,
  })
  extractAmount: number;

  @Column({ name: 'intercept', type: 'float', nullable: true, default: null })
  intercept: number;

  @Column({ name: 'slope', type: 'float', nullable: true, default: null })
  slope: number;

  @Column({ name: 'update_uid' })
  updateUid: number;

}
