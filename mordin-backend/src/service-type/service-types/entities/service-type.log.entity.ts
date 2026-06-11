import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { ServiceTypeColor } from 'src/service-type/enums/service-types.enum';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('service_types_logs')
export class ServiceTypeLog extends BaseLogEntity {
  @PrimaryColumn()
  serviceTypeId: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'price', type: 'float' })
  price: number;

  @Column({ name: 'unit_detail', type: 'varchar', length: 30 })
  unitDetail: string; // Unit of price, e.g., "VND", "USD", etc.

  @Column({ name: 'is_display', type: 'boolean', default: true })
  isDisplay: boolean;

  @Column({ name: 'color', enum: ServiceTypeColor })
  color: ServiceTypeColor;

  @Column({ name: 'update_uid' })
  updateUid: number;
}
