import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('standard_certificates_logs')
export class StandardCertificateLog extends BaseLogEntity {
  @PrimaryColumn({ name: 'standard_id', type: 'int' })
  standardId: number;

  @PrimaryColumn({ name: 'laboratory_id', type: 'int' })
  laboratoryId: number;

  @Column({ name: 'certificate_value', type: 'float' })
  certificateValue: number;
}
