import { BaseLogEntity } from "src/common/entities/base.log.entity";
import { Column, Entity,  PrimaryColumn } from "typeorm";

@Entity('convert_om_settings_logs')
export class ConvertOmSettingLog extends BaseLogEntity {
    @PrimaryColumn()
    convertOmSettingId: number;

    @Column({name: 'laboratory_setting_id' })
    laboratorySettingId: number;

    @Column({ name: 'intercept', type: 'float', nullable: true, default: 0.0159 })
    intercept: number;

    @Column({ name: 'slope', type: 'float', nullable: true, default: 0.0122 })
    slope: number;

    @Column({ name: 'update_uid', type: 'int' })
    updateUid: number;
}
