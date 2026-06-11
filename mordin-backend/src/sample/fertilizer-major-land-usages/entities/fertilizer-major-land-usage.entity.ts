import { FertilizerMajor } from 'src/fertilizer/fertilizer-majors/entities/fertilizer-major.entity';
import { ServiceFertilizerMajorUsage } from 'src/fertilizer/service-fertilizer-major-usages/entities/service-fertilizer-major-usage.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { FertilizerMajorLandScore } from 'src/sample/fertilizer-major-land-scores/entities/fertilizer-major-land-score.entity';
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

@Entity('fertilizer_major_land_usages')
@Unique('ser_fer_major_usage_book', ['serviceFertilizerMajorUsageId', 'bookId'])
export class FertilizerMajorLandUsage {
  @PrimaryGeneratedColumn({ name: 'fertilizer_major_land_usage_id' })
  fertilizerMajorLandUsageId: number;

  @Column({ name: 'service_fertilizer_major_usage_id' })
  serviceFertilizerMajorUsageId: number;

  @Column({ name: 'book_id' })
  bookId: number;

  @Column({ name: 'total_score_id' })
  totalScoreId: number;

  @Column({ name: 'fertilizer_major_id' })
  fertilizerMajorId: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @Column({ name: 'grade', type: 'int' })
  grade: number;

  @Column({ name: 'grade_text', type: 'varchar', length: 255, nullable: true })
  gradeText: string;

  @Column({ name: 'formula', type: 'varchar', length: 8, nullable: true })
  formula: string;

  @Column({ name: 'use_rate', type: 'float', nullable: true })
  useRate: number;

  @Column({ name: 'cost_per_rai', type: 'float', nullable: true })
  costPerRai: number;

  @ManyToOne(() => ServiceFertilizerMajorUsage)
  @JoinColumn({ name: 'service_fertilizer_major_usage_id' })
  serviceFertilizerMajorUsage: ServiceFertilizerMajorUsage;

  @ManyToOne(() => Book, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => FertilizerMajor)
  @JoinColumn({ name: 'fertilizer_major_id' })
  fertilizerMajor: FertilizerMajor;

  @ManyToOne(() => FertilizerMajorLandScore)
  @JoinColumn({ name: 'total_score_id' })
  fertilizerMajorLandScore: FertilizerMajorLandScore;

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
