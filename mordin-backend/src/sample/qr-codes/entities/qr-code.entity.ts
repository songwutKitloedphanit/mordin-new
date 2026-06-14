import { Book } from 'src/sample/books/entities/book.entity';
import {
  QrCodeTypeEnum,
  SampleStatusEnum,
} from 'src/sample/enums/qr-code.enum';
import { ServiceArea } from 'src/service-area/service-areas/entities/service-area.entity';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('qr_codes')
@Unique(['qrCode'])
export class QrCode {
  @PrimaryGeneratedColumn({ name: 'qr_code_id' })
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

  @Column({
    name: 'dirt_weight_om',
    type: 'float',
    nullable: true,
    default: 0.0025,
  })
  dirtWeightOm: number;

  @Column({
    name: 'dirt_weight_mehlich',
    type: 'float',
    nullable: true,
    default: 0.003,
  })
  dirtWeightMehlich: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 10, nullable: true })
  phoneNumber: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SampleStatusEnum,
    default: SampleStatusEnum.DISTRIBUTED,
  })
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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_uid' })
  createdUser: User;

  @ManyToOne(() => ServiceCalendar)
  @JoinColumn({ name: 'service_calendar_id' })
  serviceCalendar: ServiceCalendar;

  @ManyToOne(() => ServiceArea)
  @JoinColumn({ name: 'service_area_id' })
  serviceArea: ServiceArea;

  @OneToOne(() => Book, book => book.qrCode, {
    cascade: true,
  })
  book: Book;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = Date.now();
  }
}
