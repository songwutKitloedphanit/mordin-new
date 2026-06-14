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
  RelationId,
  Unique,
} from 'typeorm';

@Entity('service_areas')
@Unique('unique_code_factory', ['code', 'factoryId'])
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
