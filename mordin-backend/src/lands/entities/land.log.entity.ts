import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('lands_logs') // ใช้ชื่อ table เป็น snake_case
export class LandLog extends BaseLogEntity {
  @PrimaryColumn()
  landId: number;

  @Column({
    type: 'varchar',
    length: 45,
    name: 'land_code',
    nullable: true,
    default: null,
  })
  landCode: string;

  @Column({ type: 'varchar', length: 45, name: 'name' })
  name: string;

  @Column({
    type: 'varchar',
    length: 45,
    name: 'quota_code',
    nullable: true,
    default: null,
  })
  quotaCode: string;

  @Column({ type: 'int', name: 'area_size' })
  areaSize: number;

  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    default: null,
  })
  latitude: number;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    default: null,
  })
  longitude: number;

  @Column({ type: 'varchar', name: 'subdistrict_code' })
  subdistrictCode: string;

  @Column({ name: 'zip_code', type: 'int' })
  zipCode: number;

  @Column({
    type: 'varchar',
    length: 45,
    name: 'village',
    nullable: true,
    default: null,
  })
  village: string;

  @Column({ type: 'int', name: 'farmer_id' })
  farmerId: number;

  @Column({ type: 'int', name: 'update_uid', nullable: true, default: null })
  updateUid: number;
}
