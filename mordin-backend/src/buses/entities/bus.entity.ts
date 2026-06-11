// bus.entity.ts
import { Province } from 'src/address/provinces/entities/province.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('buses')
export class Bus {
  @PrimaryGeneratedColumn({ name: 'bus_id' })
  busId: number;

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

  @Column({ name: 'updated_at', type: 'bigint', nullable: false })
  updatedAt: number;

  @Column({ name: 'updated_uid', type: 'int', nullable: false })
  updatedUid: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_uid' })
  updateUser: User;

  @ManyToOne(() => Province)
  @JoinColumn({ name: 'registration_province_code' })
  registrationProvince: Province;

  @BeforeInsert()
  @BeforeUpdate()
  updateUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
