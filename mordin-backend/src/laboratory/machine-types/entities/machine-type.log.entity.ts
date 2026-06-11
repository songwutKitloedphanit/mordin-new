import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { MachineTypeTypes } from 'src/laboratory/enums/machine-type.enum';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('machine_types_logs')
export class MachineTypeLog extends BaseLogEntity {
  @PrimaryColumn()
  machineTypeId: number; // Primary key for the machine type entity

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'type', enum: MachineTypeTypes, nullable: false })
  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;
}
