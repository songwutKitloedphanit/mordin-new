import { SampleTypeEnum } from 'src/sample/enums/qr-code.enum';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('qr_code_labs')
export class QrCodeLab {
  @PrimaryColumn({ name: 'qr_code_lab' })
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
