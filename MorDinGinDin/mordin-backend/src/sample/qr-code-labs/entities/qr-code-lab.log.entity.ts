import { BaseLogEntity } from 'src/common/entities/base.log.entity';
import { SampleTypeEnum } from 'src/sample/enums/qr-code.enum';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('qr_code_labs_logs')
export class QrCodeLabLog extends BaseLogEntity {
  @PrimaryColumn()
  qrCodeLab: string;

  @Column({ name: 'book_id', type: 'int' })
  bookId: number;

  @Column({ name: 'printed_at', type: 'bigint' })
  printedAt: number;

  @Column({ name: 'printed_uid', type: 'int' })
  printedUid: number;

  @Column({ name: 'type', enum: SampleTypeEnum })
  type: SampleTypeEnum;
}
