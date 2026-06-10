import { Factory } from 'src/service-area/factories/entities/factory.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('service_areas')
export class ServiceArea {
  @PrimaryGeneratedColumn({ name: 'service_area_id' })
  serviceAreaId: number;

  @Column({ name: 'factory_id', type: 'int' })
  factoryId: number;

  @Column({ name: 'code', type: 'varchar', length: 10 })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 45 })
  name: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'effective_from', type: 'date', nullable: true })
  effectiveFrom: string | null;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo: string | null;

  @Column({
    name: 'superseded_by_service_area_id',
    type: 'int',
    nullable: true,
  })
  supersededByServiceAreaId: number | null;

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @BeforeInsert()
  @BeforeUpdate()
  updateUpdatedAt() {
    this.updatedAt = Date.now();
  }

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_uid' })
  updateUser: User;

  @ManyToOne(() => Factory, (factory) => factory.serviceAreas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'factory_id' })
  factory: Factory;
}
