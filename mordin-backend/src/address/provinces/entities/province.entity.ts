import { Geography } from 'src/address/geographies/entities/geography.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('provinces')
export class Province {
  @PrimaryColumn({ name: 'code' })
  code: number;

  @Column({ name: 'name_th', type: 'varchar', length: 150 })
  nameTh: string;

  @Column({ name: 'name_th_short', type: 'varchar', length: 10 })
  nameThShort: string;

  @Column({ name: 'name_en', type: 'varchar', length: 150 })
  nameEn: string;

  @Column({ name: 'geography_id' })
  geographyId: number;

  @ManyToOne(() => Geography)
  @JoinColumn({ name: 'geography_id' })
  geography: Geography;
}
