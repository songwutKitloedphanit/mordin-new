import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

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
