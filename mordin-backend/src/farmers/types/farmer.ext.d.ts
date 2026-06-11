declare module '../entities/farmer.entity' {
  // ขยาย interface ของ Class 'Farmer'
  interface Farmer {
    removedBy?: number; // เพิ่ม property ชั่วคราวเข้าไป
  }
}
