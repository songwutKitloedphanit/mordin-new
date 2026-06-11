import { FertilizerMajor } from 'src/fertilizer/fertilizer-majors/entities/fertilizer-major.entity';
import { UsageType } from 'src/fertilizer/usage-types/entities/usage-type.entity';
import { ServiceCategory } from 'src/service-type/service-categories/entities/service-category.entity';
import { SoilGradeLevel } from 'src/soil-grade/soil-grade-levels/entities/soil-grade-level.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('service_fertilizer_major_usages')
@Unique('unique_service_category_usage_type_soil_grade_level', [
  'serviceCategoryId',
  'usageTypeId',
  'soilGradeLevelId',
])
export class ServiceFertilizerMajorUsage {
  @PrimaryGeneratedColumn({ name: 'service_fertilizer_major_usage_id' })
  serviceFertilizerMajorUsageId: number;

  @Column({ name: 'service_category_id', type: 'int', nullable: false })
  serviceCategoryId: number;

  @Column({ name: 'usage_type_id' })
  usageTypeId: number;

  @Column({ name: 'soil_grade_level_id' })
  soilGradeLevelId: number;

  @Column({ name: 'fertilizer_major_id', nullable: true })
  fertilizerMajorId: number;

  @Column({
    name: 'volume',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  volume: number;

  @Column({ name: 'update_uid' })
  updateUid: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_uid' })
  updateUser: User;

  @ManyToOne(
    () => ServiceCategory,
    serviceCategory => serviceCategory.serviceFertilizerMajorUsages,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'service_category_id' })
  serviceCategory: ServiceCategory;

  @ManyToOne(() => UsageType)
  @JoinColumn({ name: 'usage_type_id' })
  usageType: UsageType;

  @ManyToOne(() => SoilGradeLevel)
  @JoinColumn({ name: 'soil_grade_level_id' })
  soilGradeLevel: SoilGradeLevel;

  @ManyToOne(() => FertilizerMajor)
  @JoinColumn({ name: 'fertilizer_major_id' })
  fertilizerMajor: FertilizerMajor;

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
