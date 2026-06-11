import { Subdistrict } from 'src/address/subdistricts/entities/subdistrict.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn({ name: 'shop_id' })
  shopId: number;

  @Column({ name: 'phone', type: 'varchar', length: 10 })
  phone: string;

  @Column({ name: 'name', type: 'varchar', length: 45 })
  name: string;

  @Column({ name: 'owner_name', type: 'varchar', length: 100 })
  ownerName: string;

  @Column({ name: 'facebook', type: 'varchar', length: 100, nullable: true })
  facebook: string;

  @Column({ name: 'line_id', type: 'varchar', length: 100, nullable: true })
  lineId: string;

  @Column({
    name: 'google_map_url',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  googleMapUrl: string;

  @Column({ name: 'subdistrict_id', type: 'varchar', length: 6 })
  subdistrictId: string;

  @Column({ name: 'zip_code', type: 'int' })
  zipCode: number;

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

  @Column({
    name: 'image_url',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  imageUrl: string;

  @Column({ name: 'created_at', type: 'bigint' })
  createdAt: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @Column({ name: 'update_uid', type: 'int', nullable: true })
  updateUid: number;

  @ManyToOne(() => Subdistrict)
  @JoinColumn({ name: 'subdistrict_id' })
  subdistrict: Subdistrict;

  @BeforeInsert()
  setCreateDate() {
    const now = Date.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @BeforeUpdate()
  updateUpdateAt() {
    const now = Date.now();
    this.updatedAt = now;
  }
}
