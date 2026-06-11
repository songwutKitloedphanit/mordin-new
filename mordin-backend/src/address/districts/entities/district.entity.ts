import { Province } from 'src/address/provinces/entities/province.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('districts')
export class District {
  @PrimaryColumn({ name: 'code' })
  code: number;

  @Column({ name: 'name_th', type: 'varchar', length: 150 })
  nameTh: number;

  @Column({ name: 'name_en', type: 'varchar', length: 150 })
  nameEn: number;

  @Column({ name: 'province_code' })
  provinceCode: number;

  @ManyToOne(() => Province)
  @JoinColumn({ name: 'province_code' })
  province: Province;
}
