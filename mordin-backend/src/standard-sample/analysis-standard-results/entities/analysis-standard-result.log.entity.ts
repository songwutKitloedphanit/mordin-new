import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { DecimalTransformer } from 'src/common/transformers/decimal.tranformer';
import { RecordTypeEnum } from 'src/sample/enums/recode-type.enum';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('analysis_standard_results_logs')
export class AnalysisStandardResultLog extends BaseLogEntity {
  @PrimaryColumn({ name: 'analysis_standard_result_id' })
  analysisStandardResultId: number;

  @Column({ name: 'analysis_standard_id', type: 'int' })
  analysisStandardId: number;

  @Column({ name: 'laboratory_id', type: 'int' })
  laboratoryId: number;

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
  recordedType: string;

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
}
