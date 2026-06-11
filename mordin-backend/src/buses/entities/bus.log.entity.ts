import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('buses_logs')
export class BusLog extends BaseLogEntity {
  // --- กำหนด Primary Key ส่วนที่เหลือ ---
  @PrimaryColumn()
  busId: number; // PK ส่วนที่ 1: ID ของ Bus ตัวจริง

  @Column({ name: 'bus_number', type: 'varchar', length: 2, nullable: false })
  busNumber: string;

  @Column({ name: 'bus_name', type: 'varchar', length: 50, nullable: false })
  busName: string;

  @Column({
    name: 'license_plate',
    type: 'varchar',
    length: 45,
    nullable: false,
  })
  licensePlate: string;

  @Column({ name: 'registration_province_code', nullable: false })
  registrationProvinceCode: number;

  @Column({
    name: 'working_area',
    type: 'varchar',
    length: 45,
    nullable: false,
  })
  workingArea: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  @Column({ name: 'updated_uid', type: 'int', nullable: false })
  updatedUid: number;
}
