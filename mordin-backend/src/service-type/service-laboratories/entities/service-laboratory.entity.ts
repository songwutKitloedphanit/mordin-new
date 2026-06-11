import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { ServiceType } from 'src/service-type/service-types/entities/service-type.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('service_laboratories')
export class ServiceLaboratory {
  @PrimaryColumn({ name: 'service_type_id' })
  serviceTypeId: number;

  @PrimaryColumn({ name: 'laboratory_id' })
  laboratoryId: number;

  @Column({ name: 'is_display', type: 'boolean', default: true })
  isDisplay: boolean;

  @ManyToOne(
    () => ServiceType,
    serviceType => serviceType.serviceLaboratories,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;

  @ManyToOne(() => Laboratory, lab => lab.serviceLaboratories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'laboratory_id' })
  laboratories: Laboratory[];
}
