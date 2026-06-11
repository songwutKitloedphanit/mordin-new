import { IsNumber } from 'class-validator';

export class QrCodeSummaryDto {
  @IsNumber()
  total: number;

  @IsNumber()
  distributed: number; // QR ว่าง

  @IsNumber()
  reserved: number; // จองวิเคราะห์ (collected/received/analyzing)

  @IsNumber()
  completed: number; // วิเคราะห์แล้ว (analyzed/approved)
}
