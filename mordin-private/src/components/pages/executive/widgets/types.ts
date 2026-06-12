import type { ReactNode } from 'react';

// ความกว้างของวิดเจ็ตบนบอร์ด: เต็มแถว หรือครึ่งแถว (จอใหญ่)
export type WidgetSpan = 'full' | 'half';

// นิยามวิดเจ็ตหนึ่งตัวบนแดชบอร์ด — เพิ่มข้อมูลส่วนใหม่ = เพิ่มรายการนี้ 1 ตัวในหน้า
export interface WidgetDef {
  id: string;
  // ชื่อที่แสดงบนหัวการ์ดและในแผงปรับแต่ง
  title: string;
  subtitle?: string;
  // คลาสไอคอน font-awesome เช่น 'fas fa-chart-bar'
  icon: string;
  defaultSpan: WidgetSpan;
  // ล็อกความกว้าง ไม่ให้ผู้ใช้ย่อ (เช่น แถว KPI ที่ออกแบบมาเต็มแถว)
  lockSpan?: boolean;
  // แสดงโดยไม่มีกรอบการ์ด — สำหรับเนื้อหาที่มีการ์ดของตัวเองอยู่แล้ว (KPI, ไทล์สรุป)
  bare?: boolean;
  render: () => ReactNode;
}

// สถานะการจัดวางที่ผู้ใช้ปรับแต่งเอง (บันทึกลง localStorage ต่อหน้า)
export interface WidgetLayoutState {
  order: string[];
  hidden: string[];
  collapsed: string[];
  spans: Record<string, WidgetSpan>;
}
