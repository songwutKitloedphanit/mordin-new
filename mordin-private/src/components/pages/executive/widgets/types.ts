import type { ReactNode } from 'react';

// ความกว้างของวิดเจ็ตบนบอร์ด: เต็มแถว หรือครึ่งแถว (จอใหญ่) — ใช้โดย WidgetBoard เดิม
export type WidgetSpan = 'full' | 'half';

// ตำแหน่ง+ขนาดบนกริด 12 ช่องของ GridWidgetBoard (หน่วย: ช่องกริด)
export interface WidgetGridPos {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ขนาดเริ่มต้น/ขั้นต่ำของวิดเจ็ตบนกริด
export interface WidgetGridDefault {
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

// ตัวเลือกชนิดการแสดงผล (กราฟ/ตาราง) ที่ผู้ใช้สลับได้ต่อวิดเจ็ต
export interface WidgetVizOption {
  id: string;
  label: string;
  icon: string;
}

// บริบทที่ส่งให้ render — viz = ชนิดการแสดงผลที่ผู้ใช้เลือกตอนนี้
export interface WidgetRenderCtx {
  viz: string | null;
}

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
  // ขนาดเริ่มต้นบนกริดของ GridWidgetBoard (ไม่ระบุ = เต็มแถว สูง 5 แถว)
  defaultGrid?: WidgetGridDefault;
  // มีหลายมุมมอง (ตาราง/แท่ง/โดนัท ฯลฯ) ให้ผู้ใช้สลับ — ตัวแรกคือค่าเริ่มต้น
  vizOptions?: WidgetVizOption[];
  defaultViz?: string;
  render: (ctx?: WidgetRenderCtx) => ReactNode;
}

// สถานะการจัดวางที่ผู้ใช้ปรับแต่งเอง (บันทึกลง localStorage ต่อหน้า) — WidgetBoard เดิม
export interface WidgetLayoutState {
  order: string[];
  hidden: string[];
  collapsed: string[];
  spans: Record<string, WidgetSpan>;
}

// สถานะการจัดวางของ GridWidgetBoard (v3): ตำแหน่งกริดอิสระ + ชนิดกราฟต่อวิดเจ็ต
export interface WidgetGridLayoutState {
  grid: Record<string, WidgetGridPos>;
  hidden: string[];
  viz: Record<string, string>;
}
