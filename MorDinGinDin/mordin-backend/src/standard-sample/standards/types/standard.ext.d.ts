import { Standard } from '../entities/standard.entity';

declare module '../entities/standard.entity' {
  interface Standard {
    removedBy?: number; // เพิ่ม property ชั่วคราวเข้าไป
  }
}