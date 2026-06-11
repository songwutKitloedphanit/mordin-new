import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

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
