import { SampleBlankResult } from 'src/sample/sample-blank-results/entities/sample-blank-result.entity';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SampleBlankType {
  SAMPLE = 'sample',
  BLANK = 'blank',
}

@Entity('sample_blanks')
export class SampleBlank {
  @PrimaryGeneratedColumn({ name: 'sample_blank_id' })
  sampleBlankId: number;

  @Column({ name: 'service_calendar_id', type: 'int' })
  serviceCalendarId: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'repeatCount', type: 'int' })
  repeatCount: number;

  @Column({ name: 'type', type: 'enum', enum: SampleBlankType })
  type: SampleBlankType;

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }

  @OneToMany(() => SampleBlankResult, (sampleResult) => sampleResult.sampleBlank, {
      cascade: true,
    })
    sampleBlankResult: SampleBlankResult[];

  @ManyToOne(() => ServiceCalendar, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_calendar_id' })
  serviceCalendar: ServiceCalendar;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_uid' })
  updateUser: User;
}
