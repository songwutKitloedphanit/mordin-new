import { Subdistrict } from 'src/address/subdistricts/entities/subdistrict.entity';
import { Bus } from 'src/buses/entities/bus.entity';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { SampleBlank } from 'src/sample/sample-blanks/entities/sample-blank.entity';
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

@Entity('service_calendars')
@Unique(['date', 'busId'])
export class ServiceCalendar {
  @PrimaryGeneratedColumn({ name: 'service_calendar_id' })
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

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @ManyToOne(() => Bus)
  @JoinColumn({ name: 'bus_id' })
  bus: Bus;

  @ManyToOne(() => Subdistrict)
  @JoinColumn({ name: 'subdistrict_code' })
  subdistrict: Subdistrict;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_uid' })
  updateUser: User;

  @OneToMany(() => LaboratorySetting, labSetting => labSetting.serviceCalendar)
  laboratorySettings: LaboratorySetting[];

  @OneToMany(() => SampleBlank, sampleBlank => sampleBlank.serviceCalendar, {
    cascade: true,
  })
  sampleBlanks: SampleBlank[];

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
