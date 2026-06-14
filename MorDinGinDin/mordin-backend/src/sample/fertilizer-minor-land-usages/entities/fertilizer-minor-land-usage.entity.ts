import { FertilizerMinor } from "src/fertilizer/fertilizer-minors/entities/fertilizer-minor.entity";
import { ServiceFertilizerMinorUsage } from "src/fertilizer/service-fertilizer-minor-usages/entities/service-fertilizer-minor-usage.entity";
import { ServiceFertilizerMinor } from "src/fertilizer/service-fertilizer-minors/entities/service-fertilizer-minor.entity";
import { Book } from "src/sample/books/entities/book.entity";
import { Result } from "src/sample/results/entities/result.entity";
import { User } from "src/users/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('fertilizer_minor_land_usages')
@Unique('serv_fer_minor_book',['serviceFertilizerMinorId', 'bookId'])
export class FertilizerMinorLandUsage {
    @PrimaryGeneratedColumn({ name: 'fertilizer_minor_land_usage_id' })
    fertilizerMinorLandUsageId: number;

    @Column({ name: 'service_fertilizer_minor_id'})
    serviceFertilizerMinorId: number;

    @Column({ name: 'book_id'})
    bookId: number;

    @Column({ name: 'result_id'})
    resultId: number;

    @Column({ name: 'level', type: 'int' })
    level: number;

    @Column({ name: 'fertilizer_minor_id' })
    fertilizerMinorId: number;

    @Column({ name: 'result_value', type: 'float', nullable: true })
    resultValue: number;

    @Column({ name: 'fertilizer_minor_name', type: 'varchar', length: 255, nullable: true })
    fertilizerMinorName: string;

    @Column({ name: 'use_rate_per_rai', type: 'float', nullable: true })
    useRatePerRai: number;

    @Column({ name: 'total_usage', type: 'float', nullable: true })
    totalUsage: number;

    @Column({ name: 'price_per_rai', type: 'float', nullable: true })
    pricePerRai: number;

    @Column({ name: 'total_price', type: 'float', nullable: true })
    totalPrice: number;

    @Column({ name: 'updated_uid'})
    updatedUid: number;

    @Column({ name: 'updated_at', type: 'bigint', nullable: true })
    updatedAt: number;

    @BeforeInsert()
    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = Date.now();
    }

    @ManyToOne(() => FertilizerMinor, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'fertilizer_minor_id' })
    fertilizerMinor: FertilizerMinor;

    @ManyToOne(() => ServiceFertilizerMinorUsage)
    @JoinColumn([
        { name: 'service_fertilizer_minor_id', referencedColumnName: 'serviceFertilizerMinorId' },
        { name: 'level', referencedColumnName: 'level' }
    ])
    serviceFertilizerMinorUsage: ServiceFertilizerMinorUsage;

    @ManyToOne(() => Book, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'book_id' })
    book: Book;

    @ManyToOne(() => Result)
    @JoinColumn({ name: 'result_id' })
    result: Result;

    @ManyToOne(() => ServiceFertilizerMinor)
    @JoinColumn({ name: 'service_fertilizer_minor_id' })
    serviceFertilizerMinor: ServiceFertilizerMinor;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'updated_uid' })
    updatedUser: User;
}
