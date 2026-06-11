import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('service_categories_logs')
export class ServiceCategoryLog extends BaseLogEntity {
  @PrimaryColumn()
  serviceCategoryId: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'service_type_id' })
  serviceTypeId: number;

  @Column({ name: 'is_display', type: 'boolean', default: true })
  isDisplay: boolean;
}
