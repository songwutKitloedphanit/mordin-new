import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import {
  Column,
  Entity,
  PrimaryColumn,
  Unique,
} from 'typeorm';

@Entity('fertilizer_major_land_usages_logs')
export class FertilizerMajorLandUsageLog extends BaseLogEntity {
    @PrimaryColumn()
    fertilizerMajorLandUsageId: number;

    @Column({ name: 'service_fertilizer_major_usage_id'})
    serviceFertilizerMajorUsageId: number;

    @Column({ name: 'book_id'})
    bookId: number;

    @Column({ name: 'total_score_id'})
    totalScoreId: number;

    @Column({ name: 'fertilizer_major_id' })
    fertilizerMajorId: number;


    @Column({ name: 'grade', type: 'int'})
    grade: number;

    @Column({ name: 'grade_text', type: 'varchar', length: 255, nullable: true })
    gradeText: string;

    @Column({ name: 'formula', type: 'varchar', length: 8, nullable: true })
    formula: string;

    @Column({ name: 'use_rate', type: 'float', nullable: true })
    useRate: number;

    @Column({ name: 'cost_per_rai', type: 'float', nullable: true })
    costPerRai: number;





}
