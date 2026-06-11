import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity('laboratory_setting_details_logs')
export class LaboratorySettingDetailLog extends BaseLogEntity {
  @PrimaryColumn({ name: 'laboratory_setting_id' })
  laboratorySettingId: number;

  @PrimaryColumn({ name: 'number_of_values', type: 'int' })
  numberOfValues: number;

  @Column({ name: 'absorbance', type: 'float' })
  absorbance: number;

  @Column({ name: 'working_standard', type: 'float' })
  workingStandard: number;
}
