/* eslint-disable prettier/prettier */
import { Land } from 'src/lands/entities/land.entity';
import { Factory } from 'src/service-area/factories/entities/factory.entity';
import { ServiceArea } from 'src/service-area/service-areas/entities/service-area.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('farmers')
export class Farmer {
  @PrimaryGeneratedColumn({ name: 'farmer_id' })
  farmerId: number;

  @Column({
    type: 'varchar',
    length: 13,
    name: 'thai_national_id',
    nullable: true,
  })
  thaiNationalId: string;

  @Column({
    type: 'varchar',
    length: 45,
    name: 'thai_farmer_id',
    nullable: true,
  })
  thaiFarmerId: string;

  @Column({ type: 'varchar', length: 10, name: 'phone' })
  phone: string;

  @Column({ type: 'date', name: 'birth_date', nullable: true })
  birthDate: string;

  @Column({ type: 'varchar', length: 45, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 45, name: 'last_name' })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'line_user_id',
    nullable: true,
  })
  lineUserId: string;

  @Column({ name: 'factory_id' })
  factoryId: number;

  @Column({ name: 'service_area_id' })
  serviceAreaId: number;

  @Column({ type: 'int', name: 'update_uid', default: 1 })
  updateUid: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @ManyToOne(() => Factory)
  @JoinColumn({ name: 'factory_id' })
  factory: Factory;

  @ManyToOne(() => ServiceArea)
  @JoinColumn({ name: 'service_area_id' })
  serviceArea: ServiceArea;

  @OneToMany(() => Land, (land) => land.farmer)
  lands: Land[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_uid' })
  updateUser: User;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeBirthDate() {
    if (this.birthDate) {
      const bDate: any = this.birthDate;
      if (typeof bDate === 'string') {
        const parts = bDate.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          if (year > 2400) {
            const ceYear = year - 543;
            this.birthDate = `${ceYear}-${parts[1]}-${parts[2]}`;
          }
        }
      } else if (bDate instanceof Date) {
        const year = bDate.getFullYear();
        if (year > 2400) {
          bDate.setFullYear(year - 543);
        }
      }
    }
  }

  @BeforeInsert()
  setCreatedAt() {
    const now = Date.now();
    this.updatedAt = now;
  }

  @BeforeUpdate()
  updateUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
