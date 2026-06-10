import { IsNumber } from 'class-validator';
export class ServiceCalendarSummaryDto {
  @IsNumber()
  totalSamples: number; // 1. ทั้งหมด (Quota รวม)

  @IsNumber()
  remaining: number;    // 2. ว่าง (Quota - Booking)

  @IsNumber()
  totalBookings: number;// 3. จองวิเคราะห์ (จำนวน Booking ที่มีจริง)

  @IsNumber()
  analyzed: number;     // 4. วิเคราะห์แล้ว (Status = Approved)
}