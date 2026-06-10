import { ServiceFertilizerMinor } from 'src/fertilizer/service-fertilizer-minors/entities/service-fertilizer-minor.entity';
import { ResultGrade } from 'src/result-grade/result-grades/entities/result-grade.entity';
import { ServiceTypeColor } from 'src/service-type/enums/service-types.enum';
import { ServiceCategory } from 'src/service-type/service-categories/entities/service-category.entity';
import { ServiceLaboratory } from 'src/service-type/service-laboratories/entities/service-laboratory.entity';
import { SoilGrade } from 'src/soil-grade/soil-grades/entities/soil-grade.entity';
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

@Entity('service_types')
export class ServiceType {
  @PrimaryGeneratedColumn({ name: 'service_type_id' })
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

  @OneToMany(() => SoilGrade, (soilGrade) => soilGrade.serviceType, {
    cascade: true,
  })
  soilGrades: SoilGrade[];

  @OneToMany(
    () => ServiceCategory,
    (serviceCategory) => serviceCategory.serviceType,
    {
      cascade: true,
    },
  )
  serviceCategories: ServiceCategory[];

  @OneToMany(() => ServiceLaboratory, (servLab) => servLab.serviceType, {
    cascade: true,
  })
  serviceLaboratories: ServiceLaboratory[];

  @OneToMany(
    () => ServiceFertilizerMinor,
    (servFerMinor) => servFerMinor.serviceType,
    {
      cascade: true,
    },
  )
  serviceFertilizerMinors: ServiceFertilizerMinor[];

  @OneToMany(() => ResultGrade, (resultGrade) => resultGrade.serviceType, {
    cascade: true,
  })
  resultGrades: ResultGrade[];
}
