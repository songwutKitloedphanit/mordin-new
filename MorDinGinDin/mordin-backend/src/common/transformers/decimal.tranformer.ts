import { ValueTransformer } from 'typeorm';

export const DecimalTransformer: ValueTransformer = {
  to: (value?: number | string | null): string | null => {
    if (value === null || value === undefined) return null;
    return value.toString(); // เก็บเป็น string ในฐานข้อมูล
  },
  from: (value?: string | null): number | null => {
    if (value === null || value === undefined) return null;
    return parseFloat(value); // คืนเป็น number ให้ฝั่ง TypeScript ใช้งานง่าย
  },
};
