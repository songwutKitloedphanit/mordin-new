# แผนปรับปรุงหน้า Executive Dashboard

> ไฟล์ที่เกี่ยวข้อง: `src/pages/executive/Dashboard.tsx`,
> `src/pages/executive/Dashboard2.tsx`,
> `src/components/pages/executive/dashboard/DashBoardCard.tsx`,
> `src/components/pages/executive/dashboard/DashboardFilter.tsx`
>
> จัดทำเมื่อ: 1 มิ.ย. 2569 (2026-06-01)

แผนนี้เรียงตามลำดับความเสี่ยง (ต่ำ → สูง) เพื่อให้ทยอยทำได้อย่างปลอดภัย
สถานะ: `[ ]` ยังไม่ทำ · `[~]` กำลังทำ · `[x]` เสร็จ

---

## สถานะการดำเนินงาน

- [x] ชุดที่ 1: Data และ Request Correctness
- [x] ชุดที่ 2: Cleanup และสถานะ UI
- [x] ชุดที่ 3: Responsive และ Component Contract
- [ ] งานภายหลัง: Export / Print รายงาน

---

## 🔴 0. Data และ Request Correctness

- [x] แยก draft filters ออกจาก applied filters และ auto refresh graph เมื่อ filter เปลี่ยน
- [x] โหลด graph ครั้งแรกหลัง base filters พร้อม ไม่ยิงซ้ำด้วยค่าเริ่มต้นชั่วคราว
- [x] ป้องกัน stale response ของ dropdown แบบต่อเนื่อง
- [x] รักษาค่า `totalCount = 0` ของ Report ไม่ให้เปลี่ยนเป็น `1`
- [x] ป้องกัน bar chart สร้างค่าแกน `-Infinity` เมื่อไม่มีข้อมูล
- [x] แยก error ตามส่วน และแสดง error ของ summary แทน skeleton ค้าง

---

## 🔴 1. ล้าง Dead Code / Mock Data (ความเสี่ยงต่ำ — ทำก่อน)

ใน `Dashboard.tsx` มี mock และ state ที่ประกาศแต่ไม่ถูก render จริง:

- [x] ลบ `mockPieChart`, `pieChartDataList`
- [x] ลบ `mockBarChart`, `chartDataList`
- [x] ลบ field ที่ไม่ถูกใช้ออกจาก `dashboardData` state:
  - `soilAnalysis`, `fertilizerRecommendation`, `soilImprovement`
- [x] ตรวจสอบ import ที่ค้างหลังลบ mock แล้วเอาออก

**ผลที่ได้:** ไฟล์เล็กลง อ่านง่าย ไม่หลอกว่ามีข้อมูลที่ไม่ได้ใช้

---

## 🟠 2. ความสม่ำเสมอของภาษา (i18n)

UI เป็นภาษาไทย แต่ข้อความสถานะยังเป็นอังกฤษ — แก้ให้ตรงกับ audience ผู้บริหาร:

- [x] `"Loading filters..."` → `"กำลังโหลดตัวกรอง..."`
- [x] `"Loading dashboard data..."` → `"กำลังโหลดข้อมูลแดชบอร์ด..."`
- [x] `"Unable to load dashboard filters."` → `"ไม่สามารถโหลดตัวกรองได้"`
- [x] `"Unable to load dashboard data."` → `"ไม่สามารถโหลดข้อมูลแดชบอร์ดได้"`
- [x] `"Unable to load service areas / districts / subdistricts."` → ข้อความไทย
- [x] แปลสถานะ loading และ error ใน Report รวม loading ของแผนที่

---

## 🟠 3. Empty State ที่ชัดเจน

ก่อนแก้ ถ้า `graphData` / `pieChartData` / `prepareData` ว่าง → section หายไปเงียบ ๆ
ผู้ใช้แยกไม่ออกระหว่าง "ไม่มีข้อมูล" กับ "กำลังโหลด/error"

- [x] เพิ่ม empty state เช่น "ไม่พบข้อมูลตามเงื่อนไขที่เลือก" ในแต่ละ section
- [x] แยกสถานะ: loading / error / empty / มีข้อมูล ให้ชัดเจน

---

## 🟡 4. UX การกรองข้อมูล + Performance

ก่อนแก้ ทุกครั้งที่เปลี่ยน select จะยิง API ใหม่ทันที (`useEffect` ที่ขึ้นกับ `selectedSearch`):

- [x] Auto refresh graph เมื่อ filter เปลี่ยน โดยเริ่มหลัง base filters พร้อม
- [x] ระหว่างโหลด ให้ทับ skeleton/overlay บนกราฟเดิม แทนแบนเนอร์ด้านบน
      (เพื่อไม่ให้หน้าเลื่อนกระตุก)

---

## 🟡 5. ฟิลเตอร์ที่ยังไม่เชื่อม / ค่า hardcode

- [x] คง `geographyList` + `handleGeographyChange` ไว้ เพราะ Report ใช้งานจริง
- [x] `yearList` hardcode ปี 2568/2567 → generate แบบ dynamic
      (เช่น ปีปัจจุบัน ย้อนหลัง N ปี)

---

## 🟢 6. Responsive / การแสดงผลกราฟ

- [x] PieChart fixed `width: 220, height: 220` → ใช้หน่วยยืดหยุ่น
- [x] BarChart fixed `height: 210px` → ใช้ความสูงขั้นต่ำและความกว้างเต็ม container
- [x] ย้ายการ register แผนที่ออกจาก render path ไปไว้ใน effect

---

## 🟢 7. ฟีเจอร์เสริมสำหรับผู้บริหาร (Optional)

- [ ] ปุ่ม Export / Print รายงาน (PDF / Excel)
- [x] แสดงสรุปวันที่และเงื่อนไขที่กรองไว้บนหัวรายงาน

---

## 🟢 8. ออกแบบ UI ให้ผู้บริหารอ่านง่าย (Dashboard.tsx)

- [x] เพิ่ม page header: ชื่อหน้า "แดชบอร์ดผู้บริหาร" + คำอธิบาย + วันที่ข้อมูล
- [x] เพิ่มแถบสรุปเงื่อนไขที่เลือก (filter chips) ใต้หัวเรื่อง
- [x] แปลชื่อธาตุดิน OM/P/K/Ca/Mg เป็นชื่อไทยเต็มในหัวกราฟ
- [x] เพิ่ม legend สีระดับความอุดมสมบูรณ์ (ดึงสีจากข้อมูลจริง)
- [x] เพิ่มคำอธิบายใต้หัวข้อแต่ละ section ให้รู้ว่าดูอะไร
- [x] เปลี่ยนคำแนะนำปุ๋ยจากกราฟวงกลม → รายการแท่งจัดอันดับ (สูตร + แถบ % + ดาวอันดับ 1)
- [x] จัดเลย์เอาต์คำแนะนำปุ๋ยเป็นการ์ด 2 คอลัมน์ แยกตามช่วงการเพาะปลูก
- [x] หัวหน้าแบบการ์ด มีไอคอนวงกลมเด่น + วันที่ + แถบเงื่อนไข
- [x] ตัวกรองยุบ/ขยายได้ (ยุบเป็นค่าเริ่มต้น) ลดความรกให้เห็นผลก่อน
- [x] เพิ่มบรรทัดสรุป "ส่วนใหญ่อยู่ระดับ … (%)" ใต้กราฟดินแต่ละตัว

---

## 🔴 9. แก้ความถูกต้องของคำแนะนำปุ๋ย (data correctness)

พบว่า `useRate` คือ **อัตราใส่ต่อไร่** (volume × quantity) ไม่ใช่สัดส่วน —
การแสดงเป็น % เดิมจึงสื่อผิด และ backend คำนวณ `count` (จำนวนแปลง) ไว้แต่ไม่ส่งออก

- [x] backend: เพิ่ม `count` ใน `PieChartItemDto` + push `Number(row.count)` ใน service
      (`graph-data-response.dto.ts`, `fertilizer-major-land-scores.service.ts`)
- [x] frontend type: เพิ่ม `count?: number` ใน `PieChartSummaryItem`
- [x] จัดอันดับสูตรปุ๋ยตาม "จำนวนแปลงที่แนะนำ" (ความนิยม) แทนการคำนวณ % จากอัตรา
- [x] แสดงอัตราใส่จริง (กก./ไร่) ใต้แต่ละสูตร + มี fallback ถ้า backend ยังไม่ส่ง count

---

## 🟢 10. ลดความรกตามฟีดแบ็กผู้บริหาร

- [x] เอาแถบหัว "แดชบอร์ดผู้บริหาร" (PageHeader + chips + วันที่) ออก — ซ้ำกับ breadcrumb ของ layout
- [x] เปลี่ยนคำแนะนำปุ๋ยจากแถบ progress → ตารางตัวเลข (สูตร / จำนวนแปลง / อัตรา กก./ไร่)
      อ่านง่าย เห็นตัวเลขชัด ติดดาวสูตรที่แนะนำมากสุด

---

## ลำดับแนะนำในการทำ

1. ข้อ 1–3 (cleanup + i18n + empty state) — เสี่ยงต่ำ เห็นผลชัด
2. ข้อ 4–5 (UX ฟิลเตอร์ + performance)
3. ข้อ 6–7 (responsive + ฟีเจอร์เสริม) ตามเวลาที่มี
