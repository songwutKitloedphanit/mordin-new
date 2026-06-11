import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('laboratory_setting_details')
export class LaboratorySettingDetail {
  @PrimaryColumn({ name: 'laboratory_setting_id' })
  laboratorySettingId: number;

  @PrimaryColumn({ name: 'number_of_values', type: 'int' })
  numberOfValues: number;

  @Column({ name: 'absorbance', type: 'float' })
  absorbance: number;

  @Column({ name: 'working_standard', type: 'float' })
  workingStandard: number;

  @ManyToOne(
    () => LaboratorySetting,
    laboratorySetting => laboratorySetting.laboratorySettingDetails,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'laboratory_setting_id' })
  laboratorySetting: LaboratorySetting;
}
