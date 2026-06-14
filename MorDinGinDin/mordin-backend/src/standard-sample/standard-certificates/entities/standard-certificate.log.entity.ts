import { BaseLogEntity } from "src/common/entities/base.log.entity";
import { Laboratory } from "src/laboratory/laboratories/entities/laboratory.entity";
import { Standard } from "src/standard-sample/standards/entities/standard.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity('standard_certificates_logs')
export class StandardCertificateLog extends BaseLogEntity{
    @PrimaryColumn({ name: 'standard_id', type: 'int' })
    standardId: number;

    @PrimaryColumn({ name: 'laboratory_id', type: 'int' })
    laboratoryId: number;

    @Column({ name: 'certificate_value', type: 'float' })
    certificateValue: number;
}
