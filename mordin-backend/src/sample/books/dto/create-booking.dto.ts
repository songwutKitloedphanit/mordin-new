import { IsInt, IsNotEmpty } from 'class-validator';

/**
 * DTO สำหรับรับข้อมูลการจองจากเกษตรกรที่ Login แล้ว
 */
export class CreateBookingDto {
  @IsInt()
  @IsNotEmpty()
  receivedServiceCalendarId: number; // วันที่และรอบรถที่เลือก

  @IsInt()
  @IsNotEmpty()
  farmerId: number; // ID เกษตรกร (จาก Session)

  @IsInt()
  @IsNotEmpty()
  landId: number; // ID แปลงที่เลือก

  @IsInt()
  @IsNotEmpty()
  serviceTypeId: number; // ประเภทบริการ (อ้อยปลูก/อ้อยตอ)
}