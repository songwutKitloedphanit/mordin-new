import { ServiceFertilizerMajorUsage } from 'src/fertilizer/service-fertilizer-major-usages/entities/service-fertilizer-major-usage.entity';
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
} from 'typeorm';

@Entity('service_categories')
export class ServiceCategory {
  @PrimaryGeneratedColumn({ name: 'service_category_id' })
  serviceCategoryId: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'service_type_id' })
  serviceTypeId: number;

  @Column({ name: 'is_display', type: 'boolean', default: true })
  isDisplay: boolean;

  // @Column({ name: 'update_uid' })
  // updateUid: number;

  // @Column({ name: 'updated_at', type: 'bigint' })
  // updatedAt: number;

  // @BeforeInsert()
  // @BeforeUpdate()
  // setUpdatedAt() {
  //     this.updatedAt = Date.now();
  // }

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'update_uid' })
  // updateUser: User;

  @ManyToOne(
    () => ServiceType,
    (serviceType) => serviceType.serviceCategories,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;

  @OneToMany(
    () => ServiceFertilizerMajorUsage,
    (serviceFertilizerMajorUsage) =>
      serviceFertilizerMajorUsage.serviceCategory,
    { cascade: true },
  )
  serviceFertilizerMajorUsages: ServiceFertilizerMajorUsage[];
}
