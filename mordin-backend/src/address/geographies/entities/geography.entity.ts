import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('geographies')
export class Geography {
  @PrimaryColumn({ name: 'id' })
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;
}
