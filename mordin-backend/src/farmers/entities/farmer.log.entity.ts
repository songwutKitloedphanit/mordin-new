import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('farmers_logs')
export class FarmerLog extends BaseLogEntity {
  @PrimaryColumn()
  farmerId: number;

  @Column({
    type: 'varchar',
    length: 13,
    name: 'thai_national_id',
    nullable: true,
  })
  thaiNationalId: string;

  @Column({
    type: 'varchar',
    length: 45,
    name: 'thai_farmer_id',
    nullable: true,
  })
  thaiFarmerId: string;

  @Column({ type: 'varchar', length: 10, name: 'phone' })
  phone: string;

  @Column({ type: 'varchar', length: 45, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 45, name: 'last_name' })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'line_user_id',
    nullable: true,
  })
  lineUserId: string;

  @Column({ name: 'factory_id' })
  factoryId: number;

  @Column({ name: 'service_area_id' })
  serviceAreaId: number;

  @Column({ type: 'int', name: 'update_uid', default: 1 })
  updateUid: number;
}
