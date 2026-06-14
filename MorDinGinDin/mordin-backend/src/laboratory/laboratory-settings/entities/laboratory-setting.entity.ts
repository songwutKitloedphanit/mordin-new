import { ConvertOmSetting } from 'src/laboratory/convert-om-settings/entities/convert-om-setting.entity';
import { WorkingStandardAxisEnum } from 'src/laboratory/enums/working-standard.enum';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { LaboratorySettingDetail } from 'src/laboratory/laboratory-setting-details/entities/laboratory-setting-detail.entity';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('laboratory_settings')
export class LaboratorySetting {
  @PrimaryGeneratedColumn({ name: 'laboratory_setting_id' })
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

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @ManyToOne(() => ServiceCalendar, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'service_calendar_id' })
  serviceCalendar: ServiceCalendar;

  @ManyToOne(() => Laboratory, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'laboratory_id' })
  laboratory: Laboratory;

  @OneToMany(
    () => LaboratorySettingDetail,
    (labSettingDetail) => labSettingDetail.laboratorySetting,
    {
      cascade: true,
      nullable: true,
    },
  )
  laboratorySettingDetails: LaboratorySettingDetail[];

  @OneToMany(
    () => ConvertOmSetting,
    (convertOmSetting) => convertOmSetting.laboratorySetting,
    {
      cascade: true,
      nullable: true,
    },
  )
  convertOmSettings: ConvertOmSetting[];

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
