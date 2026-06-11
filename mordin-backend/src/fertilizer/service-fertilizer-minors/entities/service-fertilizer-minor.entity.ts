import { FertilizerMinor } from 'src/fertilizer/fertilizer-minors/entities/fertilizer-minor.entity';
import { ServiceFertilizerMinorUsage } from 'src/fertilizer/service-fertilizer-minor-usages/entities/service-fertilizer-minor-usage.entity';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { Unit } from 'src/reference-data/units/entities/unit.entity';
import { ServiceType } from 'src/service-type/service-types/entities/service-type.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('service_fertilizer_minors')
@Unique('unique_service_type_fertilizer_minor', [
  'serviceTypeId',
  'fertilizerMinorId',
])
export class ServiceFertilizerMinor {
  @PrimaryGeneratedColumn({ name: 'service_fertilizer_minor_id' })
  serviceFertilizerMinorId: number;

  @Column({ name: 'service_type_id' })
  serviceTypeId: number;

  @Column({ name: 'fertilizer_minor_id' })
  fertilizerMinorId: number;

  @Column({ name: 'laboratory_id', nullable: true })
  laboratoryId: number;

  @Column({ name: 'unit_id' })
  unitId: number;

  @Column({ name: 'update_uid' })
  updateUid: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_uid' })
  updateUser: User;

  @ManyToOne(() => FertilizerMinor, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fertilizer_minor_id' })
  fertilizerMinor: FertilizerMinor;

  @ManyToOne(() => ServiceType, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;

  @ManyToOne(() => Laboratory)
  @JoinColumn({ name: 'laboratory_id' })
  laboratory: Laboratory;

  @OneToMany(
    () => ServiceFertilizerMinorUsage,
    servFerMinorUsage => servFerMinorUsage.serviceFertilizerMinor,
    { cascade: true }
  )
  serviceFertilizerMinorUsages: ServiceFertilizerMinorUsage[];

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
