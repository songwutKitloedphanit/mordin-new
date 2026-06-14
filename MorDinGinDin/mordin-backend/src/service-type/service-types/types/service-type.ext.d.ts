import { ServiceType } from '../entities/service-type.entity';

declare module '../entities/service-type.entity' {
  // ขยาย interface ของ Class 'Bus'
  interface ServiceType {
    removedBy?: number; // เพิ่ม property ชั่วคราวเข้าไป
  }
}