import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// History table: no UNIQUE business-key constraint (see analysis-standard.log.entity).
@Entity('soil_grades_logs')
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
