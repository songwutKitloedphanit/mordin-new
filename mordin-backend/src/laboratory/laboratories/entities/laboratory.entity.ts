import { MachineType } from 'src/laboratory/machine-types/entities/machine-type.entity';
import { ServiceLaboratory } from 'src/service-type/service-laboratories/entities/service-laboratory.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('laboratories')
@Unique('unique_lab_code', ['laboratoryCode'])
export class Laboratory {
  @PrimaryGeneratedColumn({ name: 'laboratory_id' })
  laboratoryId: number;

  @Column({ name: 'laboratory_code', type: 'varchar', length: 45 })
  laboratoryCode: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'short_name_before', type: 'varchar', length: 30 })
  shortNameBefore: string;

  @Column({ name: 'unit_before', type: 'varchar', length: 30 })
  unitBefore: string;

  @Column({ name: 'short_name_after', type: 'varchar', length: 30 })
  shortNameAfter: string;

  @Column({ name: 'unit_after', type: 'varchar', length: 30 })
  unitAfter: string;

  @Column({ name: 'range_min', type: 'float' })
  rangeMin: number;

  @Column({ name: 'range_max', type: 'float' })
  rangeMax: number;

  @Column({ name: 'machine_type_id' })
  machineTypeId: number;

  @Column({ name: 'is_main', type: 'bool', default: false })
  isMain: Boolean;

  @Column({ name: 'is_use_for_grading', type: 'bool', default: false })
  isUseForGrading: boolean;

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

  @ManyToOne(() => MachineType)
  @JoinColumn({ name: 'machine_type_id' })
  machineType: MachineType;

  @OneToMany(() => ServiceLaboratory, (servLab) => servLab.laboratories)
  serviceLaboratories: ServiceLaboratory[];
}
