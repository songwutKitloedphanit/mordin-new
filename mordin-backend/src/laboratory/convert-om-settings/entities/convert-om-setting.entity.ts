import { LaboratorySetting } from "src/laboratory/laboratory-settings/entities/laboratory-setting.entity";
import { User } from "src/users/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('convert_om_settings')
export class ConvertOmSetting {
    @PrimaryGeneratedColumn({ name: 'convert_om_setting_id'})
    convertOmSettingId: number;

    @Column({name: 'laboratory_setting_id' })
    laboratorySettingId: number;

    @Column({ name: 'intercept', type: 'float', nullable: true, default: 0.0159 })
    intercept: number;

    @Column({ name: 'slope', type: 'float', nullable: true, default: 0.0122 })
    slope: number;

    @Column({ name: 'update_uid', type: 'int' })
    updateUid: number;

    @Column({ name: 'updated_at', type: 'bigint' })
    updatedAt: number;

    @BeforeInsert()
    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = Date.now();
    }

    @ManyToOne(() => User)
    @JoinColumn({ name: 'update_uid' })
    updateUser: User;

    @ManyToOne(
    () => LaboratorySetting,
    (laboratorySetting) => laboratorySetting.convertOmSettings,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'laboratory_setting_id' })
  laboratorySetting: LaboratorySetting;
}
