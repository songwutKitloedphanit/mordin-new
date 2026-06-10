import { join } from 'path';
import { Subdistrict } from 'src/address/subdistricts/entities/subdistrict.entity';
import { Bus } from 'src/buses/entities/bus.entity';
import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { SampleBlank } from 'src/sample/sample-blanks/entities/sample-blank.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('service_calendars_logs')
export class ServiceCalendarLog extends BaseLogEntity {
  @PrimaryColumn()
  serviceCalendarId: number;

  @Column({ name: 'date', type: 'date' })
  date: Date;

  @Column({ name: 'bus_id', type: 'int' })
  busId: number;

  @Column({ name: 'number_of_samples', type: 'int' })
  numberOfSamples: number;

  @Column({ name: 'number_of_bookings', type: 'int' })
  numberOfBookings: number;

  @Column({ name: 'number_of_examinations', type: 'int' })
  numberOfExaminations: number;

  @Column({ name: 'subdistrict_code', type: 'varchar', length: 6 })
  subdistrictCode: string;

  @Column({ name: 'village', type: 'varchar', length: 100 })
  village: string;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 6 })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 10, scale: 6 })
  longitude: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;

}
