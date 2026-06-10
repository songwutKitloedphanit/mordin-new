import Joi from "joi";
import { StandardCertificate } from "src/standard-sample/standard-certificates/entities/standard-certificate.entity";
import { User } from "src/users/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('standards')
@Unique('unique_standard_name', ['standardName'])
export class Standard {
    @PrimaryGeneratedColumn({ name: 'standard_id' })
    standardId: number;

    @Column({ name: 'standard_name', type: 'varchar', length: 255 })
    standardName: string;

    @Column({ name: 'updated_uid'})
    updatedUid: number;

    @Column({ name: 'updated_at', type: 'bigint' })
    updatedAt: number;
  analysisStandardResults: any;

    @BeforeInsert()
    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = Date.now();
    }  

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'updated_uid' })
    updatedUser: User;

    @OneToMany(() => StandardCertificate, (standardCertificate) => standardCertificate.standard, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    standardCertificates: StandardCertificate[];
}
