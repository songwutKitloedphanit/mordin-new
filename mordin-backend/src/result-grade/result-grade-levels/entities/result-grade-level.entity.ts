import { ResultGrade } from 'src/result-grade/result-grades/entities/result-grade.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('result_grade_levels')
export class ResultGradeLevel {
  @PrimaryColumn({ name: 'result_grade_id' })
  resultGradeId: number;

  @PrimaryColumn({ name: 'level' })
  level: number;

  @Column({ name: 'color', type: 'varchar', length: 7, nullable: true })
  color: string;

  @Column({ name: 'cutoff_value', type: 'float', nullable: true })
  cutoffValue: number;

  @Column({ name: 'cutoff_text', type: 'varchar', length: 100, nullable: true })
  cutoffText: string;

  @Column({ name: 'score_name', type: 'varchar', length: 45 })
  scoreName: string;

  @ManyToOne(() => ResultGrade, resultGrade => resultGrade.resultGradeLevels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'result_grade_id' })
  resultGrade: ResultGrade;
}
