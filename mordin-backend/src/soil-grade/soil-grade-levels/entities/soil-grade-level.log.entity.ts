import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('soil_grade_levels_logs')
export class SoilGradeLevelLog extends BaseLogEntity {
  @PrimaryColumn()
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
}
