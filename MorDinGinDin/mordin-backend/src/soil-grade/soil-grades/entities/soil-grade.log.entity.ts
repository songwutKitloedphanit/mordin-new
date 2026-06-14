import { BaseLogEntity } from 'src/common/entities/base.log.entity';
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
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('soil_grades_logs')
@Unique('unique_service_type_laboratory_logs', [
  'serviceTypeId',
  'laboratoryId',
])
export class SoilGradeLog extends BaseLogEntity {
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
}
