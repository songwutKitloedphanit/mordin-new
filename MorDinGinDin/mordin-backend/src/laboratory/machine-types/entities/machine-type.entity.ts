import { MachineTypeTypes } from 'src/laboratory/enums/machine-type.enum';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('machine_types')
export class MachineType {
  @PrimaryGeneratedColumn({ name: 'machine_type_id' })
  machineTypeId: number; // Primary key for the machine type entity

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'type', enum: MachineTypeTypes, nullable: false })
  type: MachineTypeTypes;

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
