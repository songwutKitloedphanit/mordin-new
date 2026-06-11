import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { ServiceType } from 'src/service-type/service-types/entities/service-type.entity';
import { SoilGradeLevel } from 'src/soil-grade/soil-grade-levels/entities/soil-grade-level.entity';
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

@Entity('soil_grades')
@Unique('unique_service_type_laboratory', ['serviceTypeId', 'laboratoryId'])
export class SoilGrade {
  @PrimaryGeneratedColumn({ name: 'soil_grade_id' })
  soilGradeId: number;

  @Column({ name: 'service_type_id' })
  serviceTypeId: number;

  @Column({ name: 'laboratory_id', nullable: true })
  laboratoryId: number;

  @Column({ name: 'parameter', type: 'varchar', length: '40' })
  parameter: string;

  @Column({ name: 'update_uid' })
  updateUid: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_uid' })
  updateUser: User;

  @ManyToOne(() => Laboratory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'laboratory_id' })
  laboratory: Laboratory;

  @ManyToOne(() => ServiceType, serviceType => serviceType.soilGrades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;

  @OneToMany(() => SoilGradeLevel, soilGradeLevel => soilGradeLevel.soilGrade, {
    cascade: true,
  })
  soilGradeLevels: SoilGradeLevel[];

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
