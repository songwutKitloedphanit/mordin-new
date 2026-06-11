import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { Standard } from 'src/standard-sample/standards/entities/standard.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('standard_certificates')
export class StandardCertificate {
  @PrimaryColumn({ name: 'standard_id', type: 'int' })
  standardId: number;

  @PrimaryColumn({ name: 'laboratory_id', type: 'int' })
  laboratoryId: number;

  @Column({ name: 'certificate_value', type: 'float' })
  certificateValue: number;

  @ManyToOne(() => Standard, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'standard_id' })
  standard: Standard;

  @ManyToOne(() => Laboratory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'laboratory_id' })
  laboratory: Laboratory;
}
