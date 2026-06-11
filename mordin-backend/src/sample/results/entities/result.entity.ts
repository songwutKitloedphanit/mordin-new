import { DecimalTransformer } from 'src/common/transformers/decimal.tranformer';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { ResultGradeLevel } from 'src/result-grade/result-grade-levels/entities/result-grade-level.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { RecordTypeEnum } from 'src/sample/enums/recode-type.enum';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('results')
@Unique(['bookId', 'laboratoryId', 'serviceTypeId', 'repeatNumber'])
export class Result {
  @PrimaryGeneratedColumn({ name: 'result_id' })
  resultId: number;

  @Column({ name: 'book_id', type: 'int' })
  bookId: number;

  @Column({ name: 'laboratory_id', type: 'int' })
  laboratoryId: number;

  @Column({ name: 'service_type_id', type: 'int', nullable: true })
  serviceTypeId: number;

  @Column({ name: 'repeat_number', type: 'int' })
  repeatNumber: number;

  @Column({ name: 'recorded_at', type: 'bigint', nullable: true })
  recordedAt: number;

  @Column({
    name: 'recorded_type',
    enum: RecordTypeEnum,
    type: 'enum',
    nullable: true,
  })
  recordedType: RecordTypeEnum;

  @Column({ name: 'recorded_uid', type: 'int', nullable: true })
  recordedUid: number;

  @Column({
    name: 'pre_value',
    type: 'decimal',
    precision: 20,
    scale: 12,
    nullable: true,
    transformer: DecimalTransformer,
  })
  preValue: number;

  @Column({
    name: 'post_value',
    type: 'decimal',
    precision: 20,
    scale: 12,
    nullable: true,
    transformer: DecimalTransformer,
  })
  postValue: number;

  @Column({ name: 'laboratory_setting_id', type: 'int' })
  laboratorySettingId: number;

  @Column({ name: 'result_grade_id', type: 'int', nullable: true })
  resultGradeId: number;

  @Column({ name: 'result_grade_level', type: 'int', nullable: true })
  resultLevel: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_uid' })
  recordedUser: User;

  @ManyToOne(() => LaboratorySetting, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'laboratory_setting_id' })
  laboratorySetting: LaboratorySetting;

  @ManyToOne(() => Book, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => ResultGradeLevel, {
    onDelete: 'SET NULL',
  })
  @JoinColumn([
    { name: 'result_grade_id', referencedColumnName: 'resultGradeId' },
    { name: 'result_grade_level', referencedColumnName: 'level' },
  ])
  resultGradeLevel: ResultGradeLevel;
}
