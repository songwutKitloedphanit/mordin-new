declare module '../entities/user.entity' {
  // ขยาย interface ของ Class
  interface User {
    removedBy?: number; // เพิ่ม property ชั่วคราวเข้าไป
  }
}
