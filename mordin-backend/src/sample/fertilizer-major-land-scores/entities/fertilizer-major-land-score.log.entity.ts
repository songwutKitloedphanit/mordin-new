import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import {
  Column,
  Entity,
  PrimaryColumn,
  Unique,
} from 'typeorm';

@Entity('fertilizer_major_land_scores_logs')
export class FertilizerMajorLandScoreLog extends BaseLogEntity {
    @PrimaryColumn()
    fertilizerMajorLandScoreId: number;

    @Column({ name: 'soil_grade_id' })
    soilGradeId: number;

    @Column({ name: 'book_id' })
    bookId: number;

    @Column({ name: 'result_id', nullable: true, default: null })
    resultId: number;

    @Column({ name: 'soil_grade_level_id' })
    soilGradeLevelId: number;

    @Column({ name: 'result_value', type: 'float', nullable: true })
    resultValue: number;

    @Column({ name: 'comment', type: 'text', nullable: true })
    comment: string;

    @Column({ name: 'comment_uid', nullable: true })
    commentUid: number;

    @Column({ name: 'updated_uid' })
    updatedUid: number;
}
