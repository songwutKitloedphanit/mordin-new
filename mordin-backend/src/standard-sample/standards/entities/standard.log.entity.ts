import Joi from "joi";
import { BaseLogEntity } from "src/common/entities/base.log.entity";
import { StandardCertificate } from "src/standard-sample/standard-certificates/entities/standard-certificate.entity";
import { User } from "src/users/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('standards_logs')
export class StandardLog extends BaseLogEntity{
    @PrimaryColumn()
    standardId: number;

    @Column({ name: 'standard_name', type: 'varchar', length: 255 })
    standardName: string;

    @Column({ name: 'updated_uid'})
    updatedUid: number;

    @Column({ name: 'updated_at', type: 'bigint' })
    updatedAt: number;
}
