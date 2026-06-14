// D:\mitrpol\mordin-private\src\types\Fertilizer.ts
export interface Fertilizer {
  fertilizerId: number;
  type: FertilizerType;
  formular: string;
  N: number;
  P: number;
  K: number;
  unit: UnitType;
  quantity: number;
  price: number;
  note?: string;
  //createdAt: number;
  updatedAt?: number;
}

// ใช้ตอนเพิ่มข้อมูล
export interface FertilizerInput {
  type: FertilizerType;
  formular: string;
  N: number;
  P: number;
  K: number;
  unit: UnitType;
  quantity: number;
  price: number;
  note?: string;
}

// ใช้ตอนค้นหา
export interface FertilizerSearchInput {
  type?: string;
  formular?: string;
  unit?: UnitType;
}

export enum FertilizerType {
  Foliar = 'foliar',
  Liquid = 'liquid',
  Granular = 'granular',
  Organic = 'organic',
}

export enum UnitType {
  Kg = 'Kg',
  Bag = 'Bag',
  Ton = 'Ton',
  Liter = 'Liter',
  Ml = 'Ml',
  Gram = 'Gram',
  Ounce = 'Ounce',
}

export const fertilizerTypeLabels: Record<FertilizerType, string> = {
  [FertilizerType.Foliar]: 'ปุ๋ยเกล็ด',
  [FertilizerType.Liquid]: 'ปุ๋ยน้ำ',
  [FertilizerType.Granular]: 'ปุ๋ยเม็ด',
  [FertilizerType.Organic]: 'ปุ๋ยอินทรีย์',
};

export const unitLabels: Record<UnitType, string> = {
  [UnitType.Kg]: 'กิโลกรัม',
  [UnitType.Bag]: 'กระสอบ',
  [UnitType.Ton]: 'ตัน',
  [UnitType.Liter]: 'ลิตร',
  [UnitType.Ml]: 'มิลลิลิตร',
  [UnitType.Gram]: 'กรัม',
  [UnitType.Ounce]: 'ออนซ์',
};
