import { ServiceCategory } from '../entities/service-category.entity';

declare module '../entities/service-category.entity' {
  interface ServiceCategory {
    removedBy?: number; // เพิ่ม property ชั่วคราวเข้าไป
  }
}