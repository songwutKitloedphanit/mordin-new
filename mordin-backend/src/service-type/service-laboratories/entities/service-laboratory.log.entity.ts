import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('service_laboratories_logs')
export class ServiceLaboratoryLog extends BaseLogEntity {
  @PrimaryColumn()
  serviceTypeId: number;

  @PrimaryColumn({ name: 'laboratory_id' })
  laboratoryId: number;

  @Column({ name: 'is_display', type: 'boolean', default: true })
  isDisplay: boolean;
}
