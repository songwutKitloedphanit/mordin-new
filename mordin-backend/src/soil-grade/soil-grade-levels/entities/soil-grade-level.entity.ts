import { NormalLevelEnum } from 'src/common/enums/normal-level.enum';
import { SoilGrade } from 'src/soil-grade/soil-grades/entities/soil-grade.entity';
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

@Entity('soil_grade_levels')
@Unique('unique_soil_grade_level', ['soilGradeId', 'level'])
export class SoilGradeLevel {
  @PrimaryGeneratedColumn({ name: 'soil_grade_level_id' })
  soilGradeLevelId: number;

  @Column({ name: 'soil_grade_id' })
  soilGradeId: number;

  @Column({ name: 'level', type: 'int' })
  level: number;

  @Column({ name: 'cutoff_value', type: 'float', nullable: true })
  cutoffValue: number;

  @Column({ name: 'cutoff_text', type: 'varchar', length: 45, nullable: true })
  cutoffText: string;

  @Column({ name: 'score', type: 'float' })
  score: number;

  @Column({ name: 'score_name', type: 'varchar', length: 45 })
  scoreName: string;

  @Column({ name: 'update_uid' })
  updateUid: number;

  @Column({ name: 'updatedAt', type: 'bigint' })
  updatedAt: number;

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_uid' })
  updateUser: User;

  @ManyToOne(() => SoilGrade, (soilGrade) => soilGrade.soilGradeLevels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'soil_grade_id' })
  soilGrade: SoilGrade;
}
