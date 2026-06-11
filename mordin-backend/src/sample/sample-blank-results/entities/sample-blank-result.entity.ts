import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { RecordTypeEnum } from 'src/sample/enums/recode-type.enum';
import { SampleBlank } from 'src/sample/sample-blanks/entities/sample-blank.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sample_blank_results')
export class SampleBlankResult {
  @PrimaryGeneratedColumn({ name: 'sample_blank_result_id' })
  sampleBlankResultId: number;

  @Column({ name: 'sample_blank_id', type: 'int' })
  sampleBlankId: number;

  @Column({ name: 'laboratory_id', type: 'int' })
  laboratoryId: number;

  @Column({ name: 'repeat_number', type: 'int' })
  repeatNumber: number;

  @Column({ name: 'recorded_at', type: 'bigint' })
  recordedAt: number;

  @Column({ name: 'recorded_type', enum: RecordTypeEnum, type: 'enum' })
  recordedType: RecordTypeEnum;

  @Column({ name: 'recorded_uid', type: 'int' })
  recordedUid: number;

  @Column({ name: 'post_value', type: 'float', nullable: true })
  postValue: number;

  @Column({ name: 'pre_value', type: 'float', nullable: true })
  preValue: number;

  @Column({ name: 'certificate', type: 'float', nullable: true })
  certificate: number;

  @Column({ name: 'laboratory_setting_id', type: 'int' })
  laboratorySettingId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_uid' })
  recordedUser: User;

  @ManyToOne(() => SampleBlank, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sample_blank_id' })
  sampleBlank: SampleBlank;

  @ManyToOne(() => LaboratorySetting, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'laboratory_setting_id' })
  laboratorySetting: LaboratorySetting;

  @BeforeInsert()
  @BeforeUpdate()
  setRecordedAt() {
    this.recordedAt = Date.now();
  }
}
