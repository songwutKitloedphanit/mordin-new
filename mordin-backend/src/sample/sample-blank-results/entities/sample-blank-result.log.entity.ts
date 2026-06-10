import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { RecordTypeEnum } from 'src/sample/enums/recode-type.enum';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('sample_blank_results_logs')
export class SampleBlankResultLog extends BaseLogEntity {
  @PrimaryColumn()
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

  @Column({ name: 'post_value', type: 'float',  nullable: true })
  postValue: number;

  @Column({ name: 'pre_value', type: 'float',  nullable: true })
  preValue: number;

  @Column({ name: 'certificate', type: 'float',  nullable: true })
  certificate: number;

  @Column({ name: 'laboratory_setting_id', type: 'int' })
  laboratorySettingId: number;

  @BeforeInsert()
  @BeforeUpdate()
  setRecordedAt() {
    this.recordedAt = Date.now();
  }

}
