import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  // ดึงค่า pathname (เช่น "/admin/users", "/admin/shops") จาก URL ปัจจุบัน
  const { pathname } = useLocation();

  // ใช้ useEffect เพื่อสั่งให้โค้ดทำงานทุกครั้งที่ pathname เปลี่ยนไป
  useEffect(() => {
    // สั่งให้ window เลื่อนไปที่ตำแหน่งบนสุด (x:0, y:0)
    window.scrollTo(0, 0);
  }, [pathname]); // dependency array คือ [pathname] หมายความว่า effect นี้จะทำงานเมื่อ pathname เปลี่ยนเท่านั้น

  // Component นี้ไม่ต้องแสดงผลอะไรออกมา
  return null;
}
