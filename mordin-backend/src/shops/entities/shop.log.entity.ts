import { Subdistrict } from 'src/address/subdistricts/entities/subdistrict.entity';
import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('shops_logs')
export class ShopLog extends BaseLogEntity {
  @PrimaryColumn()
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
    name: 'image_url',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  imageUrl: string;

  @Column({ name: 'created_at', type: 'bigint' })
  createdAt: number;

}
