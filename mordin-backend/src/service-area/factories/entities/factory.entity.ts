import { ServiceArea } from 'src/service-area/service-areas/entities/service-area.entity';
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
  Unique,
} from 'typeorm';

@Entity('factories')
@Unique(['initial'])
export class Factory {
  @PrimaryGeneratedColumn({ name: 'factory_id' })
  factoryId: number;

  // @Column({ name: 'code', type: 'varchar', length: 10})
  // code: string;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'initial', type: 'varchar', length: 4 })
  initial: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @OneToMany(() => ServiceArea, serviceArea => serviceArea.factory)
  serviceAreas: ServiceArea[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_uid' })
  updateUser: User;

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
