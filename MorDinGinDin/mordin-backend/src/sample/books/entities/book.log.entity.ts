import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('books_logs')
export class BookLog extends BaseLogEntity {
  @PrimaryColumn()
  bookId: number;

  @Column({ name: 'qr_code_id', nullable: true })
  qrCodeId: number;

  @Column({ name: 'land_id', type: 'int', nullable: true, default: null })
  landId: number;

  @Column({ name: 'farmer_id', type: 'int', nullable: true, default: null })
  farmerId: number;

  @Column({ name: 'service_type_id', type: 'int', nullable: true })
  serviceTypeId: number;

  @Column({ name: 'booekd_at', type: 'bigint', nullable: true })
  bookedAt: number;

  @Column({ name: 'collect_sample_at', type: 'bigint', nullable: true })
  collectSampleAt: number;

  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
  })
  latitude: string;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
  })
  longitude: string;

  @Column({ name: 'area_size', type: 'float', nullable: true, default: null })
  areaSize: number;

  @Column({ name: 'sample_code', type: 'varchar', length: 15, nullable: true })
  sampleCode: string;

  @Column({ name: 'repeat_count', type: 'int', enum: [1, 3], nullable: true })
  repeatCount: number;

  @Column({ name: 'sample_received_at', type: 'bigint', nullable: true })
  sampleReceivedAt: number;

  @Column({ name: 'sample_received_uid', type: 'int', nullable: true })
  sampleReceivedUid: number;

  @Column({ name: 'sample_analysis_number', type: 'int', nullable: true })
  sampleAnalysisNumber: number;

  @Column({ name: 'received_service_calendar_id', type: 'int', nullable: true })
  receivedServiceCalendarId: number;

  @Column({ name: 'analysis_service_calendar_id', type: 'int', nullable: true })
  analysisServiceCalendarId: number;

  @Column({ name: 'service_area_id', type: 'int', nullable: true })
  serviceAreaId: number;

}
