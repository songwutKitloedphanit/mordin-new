import { Level } from 'src/fertilizer/enums/level.enum';
import { ServiceFertilizerMinor } from 'src/fertilizer/service-fertilizer-minors/entities/service-fertilizer-minor.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('service_fertilizer_minor_usages')
// @Unique('unique_service_fertilizer_minor_usage', ['serviceFertilizerMinorId', 'level'])
export class ServiceFertilizerMinorUsage {
  // @PrimaryGeneratedColumn({ name: 'service_fertilizer_minor_usage_id' })
  // serviceFertilizerMinorUsageId: number;

  @PrimaryColumn({ name: 'service_fertilizer_minor_id' })
  serviceFertilizerMinorId: number;

  @PrimaryColumn({ name: 'level', type: 'int' })
  level: number;

  @Column({ name: 'cutoff_value', type: 'float' })
  cutoffValue: number;

  @Column({ name: 'cutoff_text', type: 'varchar', length: 100 })
  cutoffText: string;

  @Column({ name: 'fertilizer_usage_value', type: 'float' })
  fertilizerUsageValue: number;

  @Column({ name: 'update_uid' })
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

  @ManyToOne(() => ServiceFertilizerMinor, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_fertilizer_minor_id' })
  serviceFertilizerMinor: ServiceFertilizerMinor;
}
