import { FertilizerMajorTypes } from 'src/fertilizer/enums/fertilizer.enum';
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
  Unique,
} from 'typeorm';

@Entity('fertilizer_majors')
@Unique('unique_type_formular', ['type', 'formular'])
export class FertilizerMajor {
  @PrimaryGeneratedColumn({ name: 'fertilizer_major_id' })
  fertilizerMajorId: number;

  @Column({ name: 'type', enum: FertilizerMajorTypes })
  type: FertilizerMajorTypes;

  @Column({ name: 'formular', type: 'varchar', length: 8 })
  formular: string;

  @Column({ name: 'N', type: 'int' })
  N: number;

  @Column({ name: 'P', type: 'int' })
  P: number;

  @Column({ name: 'K', type: 'int' })
  K: number;

  @Column({ name: 'quantity', type: 'float' })
  quantity: number;

  @Column({ name: 'unit_id' })
  unitId: number;

  @Column({ name: 'price', type: 'float' })
  price: number;

  @Column({ name: 'price_per_unit', type: 'float' })
  pricePerUnit: number;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string;

  @Column({ name: 'updated_at', type: 'bigint' })
  updatedAt: number;

  //add update user id
  @Column({ name: 'update_uid', type: 'int', nullable: true })
  updateUid: number;

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
    this.pricePerUnit = this.price / this.quantity;
  }
}
