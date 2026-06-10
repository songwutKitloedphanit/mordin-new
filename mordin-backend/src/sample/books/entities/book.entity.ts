import { Farmer } from 'src/farmers/entities/farmer.entity';
import { Land } from 'src/lands/entities/land.entity';
import { FertilizerMajorLandScore } from 'src/sample/fertilizer-major-land-scores/entities/fertilizer-major-land-score.entity';
import { FertilizerMajorLandUsage } from 'src/sample/fertilizer-major-land-usages/entities/fertilizer-major-land-usage.entity';
import { FertilizerMinorLandUsage } from 'src/sample/fertilizer-minor-land-usages/entities/fertilizer-minor-land-usage.entity';
import { QrCode } from 'src/sample/qr-codes/entities/qr-code.entity';
import { Result } from 'src/sample/results/entities/result.entity';
import { ServiceArea } from 'src/service-area/service-areas/entities/service-area.entity';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { ServiceType } from 'src/service-type/service-types/entities/service-type.entity';
import { User } from 'src/users/entities/user.entity';
import { Subdistrict } from 'src/address/subdistricts/entities/subdistrict.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn({ name: 'book_id' })
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

  @Column({ type: 'varchar', name: 'subdistrict_code', length: 6, nullable: true, default: null })
  subdistrictCode: string;

  @Column({ name: 'zip_code', type: 'int', nullable: true, default: null })
  zipCode: number;

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

  @OneToOne(() => QrCode, (qrCode) => qrCode.book, { 
    nullable: true
  })
  @JoinColumn({ name: 'qr_code_id' })
  qrCode: QrCode;

  @ManyToOne(() => Land)
  @JoinColumn({ name: 'land_id' })
  land: Land;

  @ManyToOne(() => ServiceType)
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sample_received_uid' })
  sampleReceivedUser: User;

  @ManyToOne(() => ServiceCalendar)
  @JoinColumn({ name: 'received_service_calendar_id' })
  receivedServiceCalendar: ServiceCalendar;

  @ManyToOne(() => ServiceCalendar)
  @JoinColumn({ name: 'analysis_service_calendar_id' })
  analysisServiceCalendar: ServiceCalendar;

  @ManyToOne(() => ServiceArea)
  @JoinColumn({ name: 'service_area_id' })
  serviceArea: ServiceArea;

  @ManyToOne(() => Farmer, { nullable: true })
  @JoinColumn({ name: 'farmer_id' })
  farmer: Farmer; 

  @ManyToOne(() => Subdistrict, { nullable: true })
  @JoinColumn({ name: 'subdistrict_code', referencedColumnName: 'code' })
  subdistrict: Subdistrict;

  @OneToMany(() => FertilizerMajorLandScore, (score) => score.book)
  ferMajorLandScore: FertilizerMajorLandScore[];

  @OneToMany(() => FertilizerMajorLandUsage, (usage) => usage.book)
  ferMajorLandUsages: FertilizerMajorLandUsage[];

  @OneToMany(() => FertilizerMinorLandUsage, (usage) => usage.book)
  ferMinorLandUsages: FertilizerMinorLandUsage[];
  
  @OneToMany(() => Result, (result) => result.book)
  results: Result[];
}
