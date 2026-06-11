import { District } from 'src/address/districts/entities/district.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('subdistricts')
export class Subdistrict {
  @PrimaryColumn({ name: 'code', type: 'varchar', length: 6 })
  code: number;

  @Column({ name: 'zip_code' })
  zipCode: number;

  @Column({ name: 'name_th', type: 'varchar', length: 150 })
  nameTh: string;

  @Column({ name: 'name_en', type: 'varchar', length: 150 })
  nameEn: string;

  @Column({ name: 'district_code' })
  districtCode: number;

  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
  })
  latitude: number;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
  })
  longitude: number;

  @ManyToOne(() => District)
  @JoinColumn({ name: 'district_code' })
  district: District;
}
