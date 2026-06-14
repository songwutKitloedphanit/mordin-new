# แผนปรับปรุง UX/UI ระบบ Mordin (mordin-private)

> อ้างอิงดีไซน์: `C:\mordin\ui-redesign-mockup.html` (โทนน้ำเงินมิตรผล #005092)
> วันที่จัดทำ: 10 มิ.ย. 2569

## เป้าหมาย

1. ปรับ UX/UI ทั้งระบบให้ **ดูง่าย ใช้งานง่าย สไตล์เดียวกันทุกหน้า** ตาม mockup
2. **ใช้งานจากมือถือได้จริง** ทุกหน้าที่ต้องใช้งาน (จนท.ภาคสนาม + ชาวไร่)
3. ใส่**โลโก้มิตรผล**ให้ชัดเจน (ไฟล์มีอยู่แล้ว: `/private/assets/img/mitrphol_research.webp`)
4. **แก้เท่าที่จำเป็น** — เฉพาะชั้นแสดงผล (.tsx + CSS) เท่านั้น

## ขอบเขตที่ "ไม่แตะ" เด็ดขาด

| ส่วน | เหตุผล |
|---|---|
| Database / schema / migrations | ตามนโยบาย no-DB-change |
| API contracts / endpoints / `src/services/` (API wrappers) | สัญญาเดิมต้องอยู่ครบ |
| สูตรคำนวณปุ๋ย, เกณฑ์ result grade, logic แปลผลแล็บ | sensitive — ห้ามแตะ |
| Auth, role guards, token, routes ทุกเส้น | ของเดิมทำงานดีอยู่ |
| Handsontable / DataTables / Chart internals | restyle ด้วย CSS เท่านั้น |
| `mordin-backend`, `mordin-public` (PHP) | นอกขอบเขตแผนนี้ (ทำเฟสถัดไปถ้าต้องการ) |

## หลักการทางเทคนิค (ตาม AGENTS.md)

- **Bootstrap 5 first** — โค้ดใหม่ใช้ Bootstrap utilities ไม่เพิ่ม Tailwind ในไฟล์ที่ไม่ใช่ Tailwind เดิม
- Tailwind คงไว้เฉพาะที่เดิม (executive Dashboard, Sidebar/Header, components/ui)
- ฟอนต์ **Sarabun** (ของเดิม) — ไม่เปลี่ยน
- **Dark mode ต้องทำงานต่อทุกจุดที่ปรับ** (ระบบมี toggle ใช้อยู่จริง)
- ทุก route / หน้า / ฟอร์ม / ตาราง / ฟิลเตอร์ / flow เดิม **อยู่ครบ 100%**
- จบทุกรอบ: `npm run build` + `npm run lint` ผ่าน, อัปเดต `FRONTEND_PROGRESS.md` + `CODEX_CONTEXT.md`

---

## เฟสการทำงาน

### Phase 0 — Foundation: design tokens (ทำครั้งเดียว ส่งผลทุกหน้า)

**ไฟล์:** `src/index.css`, `tailwind.config.js` (sync palette)

- มาตรฐานสีน้ำเงินมิตรผล **#005092** ทั้งระบบ (ปัจจุบัน `--mp-dark` = #004a8f, Sidebar ใช้ #005092 — ไม่ตรงกัน → รวมเป็นค่าเดียว)
- เพิ่ม token ที่ mockup ใช้: status chips (เขียว/เหลือง/แดง/ฟ้า/เทา/ม่วง), KPI accent, radius, shadow, insight tiles
- เพิ่ม responsive utility กลาง: ตารางบนมือถือ (scroll-x แบบจงใจ หรือ card list), touch target ≥ 44px

**ผลลัพธ์:** ทุกหน้าที่ใช้ `private-card`, `private-metric-card` ฯลฯ ได้โทนใหม่ทันทีโดยไม่แก้ tsx

### Phase 1 — Layout Shell (โครงที่ทุกหน้าใช้ร่วม)

**ไฟล์:** `components/layout/admin/Sidebar.tsx`, `Header.tsx`, `layouts/AdminLayout.tsx`

- Sidebar: เปลี่ยนจาก accordion ยุบ/ขยาย → **แบนราบเห็นทุกเมนู + group label** ตาม mockup, เมนู active = พื้นขาวตัวน้ำเงิน + แถบเหลือง accent
- **โลโก้มิตรผล** (ไฟล์ webp เดิม) บนหัว Sidebar + หน้า Login
- Topbar: เพิ่ม breadcrumb, คงปุ่ม dark mode / แจ้งเตือน / โปรไฟล์เดิม
- มือถือ: drawer เดิมมีอยู่แล้ว (`lg:static -translate-x-full`) — คงไว้ ปรับขนาดปุ่ม/ระยะให้กดง่าย

### Phase 2 — Shared Components (จุด leverage สูงสุด)

**ไฟล์:** `components/gui/` (GuiButton, GuiForm, SearchAndPaginationTable, DataTableWrapper, Pagination, ConfirmAlert), `components/ui/`

- **restyle ในที่เดิม ไม่เปลี่ยน props/behavior** → ~50 หน้าที่ใช้ component เหล่านี้ได้ผลพร้อมกัน
- มาตรฐานใหม่: status chip, ปุ่ม action แบบ icon (ดู/แก้/ลบ), toolbar ค้นหา+ฟิลเตอร์แถวเดียว, pagination แบบ mockup
- ตารางทุกตัว: มือถือ → ห่อ `table-responsive` + แถวหนาขึ้น หรือ card list ตามความเหมาะของหน้า

### Phase 3 — ปรับรายหน้า (เรียงตามความถี่ใช้งานจริง)

| รอบ | กลุ่ม | หน้า | โน้ตมือถือ |
|---|---|---|---|
| 3.1 | **Operations** (จนท.ใช้บ่อย/ใช้หน้างาน) | sample-receiving (2), officer qrcode (2), lab-result (2), analysis-report (3) | สำคัญสุด — ใช้มือถือ/แท็บเล็ตจริง สแกน QR ต้องลื่น |
| 3.2 | **Management** (8 โมดูล CRUD) | user, farmer, bus, shop, land, laboratory, service-area, qrcode (~24 หน้า) | ได้จาก Phase 2 เกือบหมด + เก็บรายหน้า |
| 3.3 | **Dashboard / Report** | Dashboard.tsx, Dashboard2.tsx | Tailwind scoped เดิม — ปรับโทนสีเข้าธีม ไม่ rewrite |
| 3.4 | **Settings** (6 โมดูล) | service-calendar, fertilizer-usages, fertilizer-prices, exam-setting, service-type, standard (~24 หน้า) | แสดงผล/ฟอร์มเท่านั้น **ไม่แตะสูตรและตัวเลขเกณฑ์** |
| 3.5 | **Auth + อื่นๆ** | login, profile, CollectSample | CollectSample ชาวไร่สแกนจากมือถือ — ต้อง mobile-first ที่สุด |

ข้อยกเว้นที่วางไว้ล่วงหน้า:
- **LabResultMultiInput** (Handsontable spreadsheet) เป็นเครื่องมือ desktop โดยธรรมชาติ → บนมือถือแนะนำผู้ใช้ไปโหมดกรอกรายตัวอย่าง (LabResult เดิม) แทน ไม่ฝืนยัด spreadsheet ลงจอเล็ก

### Phase 4 — Mobile QA sweep ทั้งระบบ

เกณฑ์ผ่านต่อหน้า (ทดสอบ 360px / 768px / desktop):
- [ ] ไม่มี horizontal overflow ที่ไม่ตั้งใจ
- [ ] ปุ่ม/ลิงก์กดได้ ≥ 44×44px
- [ ] ฟอร์มเรียง 1 คอลัมน์บนมือถือ
- [ ] ตารางอ่านได้ (card list หรือ scroll-x จงใจ)
- [ ] Modal/SweetAlert ไม่ล้นจอ
- [ ] Dark mode ไม่เพี้ยน

### Phase 5 — ปิดงาน

- `npm run build` + `npm run lint` ผ่านทุกรอบ
- ทดสอบ flow หลักตาม `MANUAL_TEST_CASES.md`
- อัปเดต `FRONTEND_PROGRESS.md` + `CODEX_CONTEXT.md` ทุกรอบ

---

## ลำดับส่งมอบ (แต่ละรอบ review ได้อิสระ)

1. **Round 1** = Phase 0 + 1 → เห็นโฉมใหม่ทั้ง shell (sidebar/topbar/โทนสี/โลโก้)
2. **Round 2** = Phase 2 → ทุกหน้าเริ่มเข้าธีมอัตโนมัติ
3. **Round 3** = Phase 3.1 Operations (กลุ่มที่ใช้มือถือจริง)
4. **Round 4** = Phase 3.2 Management
5. **Round 5** = Phase 3.3 + 3.4 Dashboard/Settings
6. **Round 6** = Phase 3.5 + Phase 4 mobile sweep ทั้งระบบ

## ประเด็นให้ตัดสินใจก่อนเริ่ม

1. **สีหลัก**: รวมเป็น #005092 ค่าเดียวทั้งระบบ → *แนะนำ: ใช่ (ตรง Sidebar จริงและ mockup)*
2. **Sidebar**: เลิก accordion เปลี่ยนเป็นแบนราบตาม mockup → *แนะนำ: ใช่ เห็นทุกเมนูไม่ต้องคลิกเพิ่ม*
3. **mordin-public (PHP เว็บชาวไร่)**: อยู่นอกแผนนี้ก่อน ทำเป็นเฟสแยกถ้าต้องการ → *แนะนำ: ใช่ แยกรอบ*
