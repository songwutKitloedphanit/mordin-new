import { Book } from "src/sample/books/entities/book.entity";
import { Result } from "src/sample/results/entities/result.entity";
import { SoilGradeLevel } from "src/soil-grade/soil-grade-levels/entities/soil-grade-level.entity";
import { SoilGrade } from "src/soil-grade/soil-grades/entities/soil-grade.entity";
import { User } from "src/users/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('fertilizer_major_land_scores')
@Unique('soil_grade_book', ['soilGradeId', 'bookId'])
export class FertilizerMajorLandScore {
    @PrimaryGeneratedColumn({ name: 'fertilizer_major_land_score_id' })
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

    @Column({ name: 'updated_at', type: 'bigint'})
    updatedAt: number;

    @Column({ name: 'updated_uid' })
    updatedUid: number;

    @BeforeInsert()
    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = Date.now();
    }

    @ManyToOne(() => SoilGrade)
    @JoinColumn({ name: 'soil_grade_id' })
    soilGrade: SoilGrade;

    @ManyToOne(() => Book, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'book_id' })
    book: Book;

    @ManyToOne(() => Result)
    @JoinColumn({ name: 'result_id' })
    result: Result;

    @ManyToOne(() => SoilGradeLevel, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'soil_grade_level_id' })
    soilGradeLevel: SoilGradeLevel;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'comment_uid' })
    commentUser: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'updated_uid' })
    updatedUser: User;
}
