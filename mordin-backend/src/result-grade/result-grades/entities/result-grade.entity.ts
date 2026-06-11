import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { ResultGradeLevel } from 'src/result-grade/result-grade-levels/entities/result-grade-level.entity';
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

@Entity('result_grades')
export class ResultGrade {
  @PrimaryGeneratedColumn({ name: 'result_grade_id' })
  resultGradeId: number;

  @Column({ name: 'service_type_id' })
  serviceTypeId: number;

  @Column({ name: 'laboratory_id' })
  laboratoryId: number;

  @Column({ name: 'updated_uid' })
  updatedUid: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'updated_uid' })
  updatedUser: User;

  @ManyToOne(() => ServiceType, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;

  @ManyToOne(() => Laboratory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'laboratory_id' })
  laboratory: Laboratory;

  @OneToMany(() => ResultGradeLevel, level => level.resultGrade, {
    cascade: true,
  })
  resultGradeLevels: ResultGradeLevel[];

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
