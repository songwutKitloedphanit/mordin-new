import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { QrCodeTypeEnum, SampleStatusEnum } from 'src/sample/enums/qr-code.enum';
import {
  Column,
  Entity,
  PrimaryColumn,
  Unique,
} from 'typeorm';

@Entity('qr_codes_logs')
export class QrCodeLog extends BaseLogEntity {
  @PrimaryColumn()
  qrCodeId: number;

  @Column({ name: 'qr_code' })
  qrCode: string;

  @Column({ name: 'created_uid' })
  createdUid: number;

  @Column({ name: 'type', enum: QrCodeTypeEnum })
  type: QrCodeTypeEnum;

  @Column({ name: 'service_area_id', type: 'int', nullable: true })
  serviceAreaId: number;

  @Column({ name: 'service_calendar_id', type: 'int', nullable: true })
  serviceCalendarId: number;

  @Column({ name: 'dirt_weight_om', type: 'float', nullable: true, default: 0.0025 })
  dirtWeightOm: number;

  @Column({ name: 'dirt_weight_mehlich', type: 'float', nullable: true, default: 0.003 })
  dirtWeightMehlich: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 10, nullable: true })
  phoneNumber: string;

  @Column({ name: 'status', type: 'enum', enum: SampleStatusEnum, default: SampleStatusEnum.DISTRIBUTED })
  status: SampleStatusEnum;

  @Column({
    type: 'varchar',
    length: 13,
    name: 'thai_national_id',
    nullable: true,
  })
  thaiNationalId: string;

  @Column({ type: 'varchar', length: 45, name: 'land_code', nullable: true })
  landCode: string;

  @Column({ type: 'varchar', length: 45, name: 'land_name', nullable: true })
  landName: string;

  @Column({ name: 'created_at', type: 'bigint' })
  createdAt: number;
}
