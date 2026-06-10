import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import {
  Column,
  Entity,
  PrimaryColumn,
  Unique,
} from 'typeorm';
@Entity('result_grades_logs')
export class ResultGradeLog extends BaseLogEntity {
    @PrimaryColumn()
    resultGradeId: number;

    @Column({ name: 'service_type_id' })
    serviceTypeId: number;

    @Column({ name: 'laboratory_id'})
    laboratoryId: number;

    @Column({ name: 'updated_uid'})
    updatedUid: number;
}
