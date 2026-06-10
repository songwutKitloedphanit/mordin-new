/* eslint-disable prettier/prettier */
import { Subdistrict } from 'src/address/subdistricts/entities/subdistrict.entity';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  Unique,
} from 'typeorm';

@Entity('lands') // ใช้ชื่อ table เป็น snake_case
@Unique('land_code', ['landCode']) // กำหนดให้ landCode เป็น unique
@Unique('owner_land_name', ['farmerId', 'name']) // กำหนดให้ farmerId และ name เป็น unique ร่วมกัน
export class Land {
  @PrimaryGeneratedColumn({ name: 'land_id' })
  landId: number;

  @Column({ type: 'varchar', length: 45, name: 'land_code', nullable: true, default: null })
  landCode: string;

  @Column({ type: 'varchar', length: 45, name: 'name' })
  name: string;

  @Column({ type: 'varchar', length: 45, name: 'quota_code', nullable: true, default: null })
  quotaCode: string;

  @Column({ type: 'int', name: 'area_size' })
  areaSize: number;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 6, nullable: true, default: null })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 10, scale: 6, nullable: true, default: null })
  longitude: number;

  @Column({ type: 'varchar', name: 'subdistrict_code' })
  subdistrictCode: string;

  @Column({ name: 'zip_code', type: 'int' })
  zipCode: number;

  @Column({ type: 'varchar', length: 45, name: 'village', nullable: true, default: null })
  village: string;

  @Column({ type: 'int', name: 'farmer_id' })
  farmerId: number;

  @Column({ type: 'int', name: 'update_uid', nullable: true, default: null })
  updateUid: number | null;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @BeforeInsert()
  setCreatUpdateAt() {
    const now = Date.now();
    this.updatedAt = now;
  }

  @BeforeUpdate()
  updateUpdatedAt() {
    const now = Date.now();
    this.updatedAt = now;
  }

  @ManyToOne(() => Farmer, farmer => farmer.lands)
  @JoinColumn({ name: 'farmer_id' })
  farmer: Farmer;

  @ManyToOne(() => Subdistrict)
  @JoinColumn({ name: 'subdistrict_code', referencedColumnName: 'code' })
  subdistrict: Subdistrict;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_uid' })
  updateUser: User;
}
