import { Unit } from 'src/reference-data/units/entities/unit.entity';
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

@Entity('fertilizer_minors')
export class FertilizerMinor {
  @PrimaryGeneratedColumn({ name: 'fertilizer_minor_id', type: 'int' })
  fertilizerMinorId: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'price_per_unit', type: 'float' })
  pricePerUnit: number;

  @Column({ name: 'unit_id' })
  unitId: number;

  @Column({ name: 'benefit', type: 'text', nullable: false })
  benefit: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  @Column({ name: 'update_uid', type: 'int' })
  updateUid: number;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_uid' })
  updateUser: User;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
