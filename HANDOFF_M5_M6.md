# HANDOFF: งานที่เหลือของแผน Match-Mockup (M5 + M6) — สำหรับ session/โมเดลถัดไป

> **สถานะ 2026-06-11:** ✅ **M5 เสร็จแล้ว** (greeting + การ์ดรอบบริการ — ใช้
> `getUpcomingServiceCalendars()` แทน searchServiceCalendars; verified กับ backend จริง
> ทั้ง light/dark/375px) ✅ **M6 ส่วน implement เสร็จแล้ว** (login split-hero + mobile
> brand row; verified 1280/375 + ล็อกอินจริง E2E ผ่าน) ⏳ **เหลือเฉพาะ §4.3 ข้อ 3-5**:
> ให้ user ล็อกอิน admin `MordinKU` แล้วไล่เช็คลิสต์ 4 กลุ่มเมนู + แก้จุดเพี้ยน + docs ปิดแผน
> รายละเอียด/ข้อค้นพบ (รวม ⚠️ security finding: backend dev รับทุก credentials ผ่าน APIM
> sandbox) อยู่ใน `setting/docs/FRONTEND_PROGRESS.md` (2 entries บนสุด) + `CODEX_CONTEXT.md`

> **อ่านก่อนเริ่ม (ตามลำดับ):** ไฟล์นี้ → `C:\mordin\AGENTS.md` (กติกาโปรเจกต์) →
> `C:\mordin\UI_MATCH_MOCKUP_PLAN.md` (แผนแม่) → `C:\mordin\setting\docs\CODEX_CONTEXT.md` (สถานะล่าสุด)
> **ดีไซน์ต้นแบบ:** เปิด `C:\mordin\ui-redesign-mockup.html` ในเบราว์เซอร์เทียบได้ตลอด
> วันที่จัดทำ: 10 มิ.ย. 2569

---

## 1. สถานะปัจจุบัน (อะไรเสร็จแล้ว — ห้ามทำซ้ำ)

โปรเจกต์: ปรับ UI ของ `C:\mordin\mordin-private` (React 19 + Vite + Bootstrap 5/Kaiadmin, Tailwind เฉพาะที่)
ให้เหมือน mockup มากที่สุด **โดยแตะเฉพาะชั้นแสดงผล**

เสร็จแล้ว: UI Redesign Rounds 1-6 (โทนสี #005092, Sidebar แบนราบไทย+โลโก้, restyle ปุ่ม/ตาราง/ฟอร์ม/การ์ดทั้งระบบ, mobile safety net) และ Match-Mockup **M1-M4**:
- M1: Topbar sticky ขาว + breadcrumb + page head กลาง (Header.tsx/AdminLayout.tsx)
- M2: KPI card แบบเดียวทั้งระบบ (`exec-kpi-card` — `GenCard1` + `ManagementKpiCard` render ทรงเดียวกัน), status chips `.private-chip-*`, ปุ่ม action ตารางแบบเงียบ (CSS override `btn-icon btn-round`), กฎ `:has()` กันหัวซ้ำ
- M3: toolbar ตารางแถวเดียว + `.spt-search` ไอคอนแว่นฝังใน + `Column.searchText` API + `RowAvatar` (ใช้ใน FarmerManagement/UserManagement)
- M4: `components/gui/SampleFlow.tsx` (timeline ใช้ class `.flow-*` เดิม) ใส่ใน AnalysisReportInfo แล้ว + scan-zone hero (`.private-scan-zone`) ในหน้า SampleReceivingManagement

**Build ล่าสุดผ่าน** (`npm run build` ใน mordin-private)

### ⚠️ มี session อื่นทำงานคู่ขนานใน repo เดียวกัน
เขาทำ: move/supersede ของ ServiceArea (frontend+backend), หน้า public PHP, timeline/scan ใน receiving pages
**กติกา: ห้าม revert/แก้ logic ที่เขาเพิ่ม** ถ้าไฟล์ที่จะแก้มีโค้ดใหม่ที่ไม่รู้จัก ให้แตะเฉพาะส่วน "หน้าตา" ที่งานนี้ต้องการ และก่อนแก้ไฟล์ใด **อ่านไฟล์เวอร์ชันปัจจุบันก่อนเสมอ** (อย่าเชื่อ snapshot เก่า)

## 2. กติกาตายตัว (ละเมิด = งานเสีย)

1. ห้ามแตะ: DB/schema, API contracts, endpoint ใหม่, `src/services/` (เว้นแต่เรียก endpoint ที่มีอยู่), routes, auth/roles/MSAL, สูตรปุ๋ย/เกณฑ์วิเคราะห์, vendor CSS (`src/assets/css/kaiadmin*.css`, `plugins*.css`, `demo.css`)
2. ฟีเจอร์เดิมอยู่ครบ 100% — จัดวางใหม่ได้ ลบไม่ได้
3. **ห้าม hardcode ข้อมูลปลอม** (ตัวเลขสถิติ, activity ปลอม) — ถ้าไม่มี API ให้ตัดส่วนนั้นออกแล้วบันทึก blocker
4. ทุกสไตล์ใหม่ต้องมีคู่ dark mode (`.private-layout-dark main ...`) — kaiadmin ใช้ `!important` ดังนั้น override ต้อง `!important` และ scope light ด้วย `.private-layout-root:not(.private-layout-dark) main`
5. โค้ดใหม่ใช้ **Bootstrap utilities** — ห้ามเพิ่ม Tailwind ยกเว้นไฟล์ Tailwind เดิม (executive Dashboard, components/ui, layout)
6. token ที่มีอยู่แล้วใน `src/index.css` ให้ใช้ซ้ำ อย่าประกาศใหม่: `.private-chip-*`, `.exec-kpi-card*`, `.flow-*`, `.private-scan-zone`, `.spt-search`, `.private-row-avatar`, `.private-page-head`
7. จบแต่ละงาน: `npm run build` ผ่าน + `npx eslint <ไฟล์ที่แก้>` 0 errors (warnings เดิมปล่อยได้) + อัปเดต `C:\mordin\setting\docs\FRONTEND_PROGRESS.md` (เพิ่มบนสุด) และ `CODEX_CONTEXT.md` (แทรก Latest Update บนสุด เปลี่ยนอันเดิมเป็น Previous)

---

## 3. งาน M5 — Dashboard: greeting + การ์ด "รอบบริการที่กำลังมาถึง"

**ไฟล์หลัก:** `src/pages/executive/Dashboard.tsx` (ไฟล์นี้เป็น Tailwind-scoped — ใช้ Tailwind ได้)
**อ้างอิง mockup:** ส่วน `page-head` ("สวัสดีตอนเช้า, คุณสมชาย 👋") และการ์ด "รอบบริการที่กำลังมาถึง" (กล่องวันที่สี + ชื่องาน + chip "อีก N วัน")

### 3.1 Greeting head
1. import `useAuth` จาก `@/contexts/AuthContext` (ดูตัวอย่างการใช้ใน `components/layout/admin/Header.tsx` — มี `user?.firstName`)
2. สร้างข้อความตามเวลา: 5-11 น. = "สวัสดีตอนเช้า", 11-16 = "สวัสดีตอนบ่าย", 16-20 = "สวัสดีตอนเย็น", อื่นๆ = "สวัสดี"
3. แสดงเหนือ `ExecutiveReportToolbar` (หรือรวมใน area เดียวกัน): บรรทัดใหญ่ `{greeting}, คุณ{user?.firstName ?? ''} 👋` + บรรทัดรองสีเทาบอกชื่อรายงานเดิม
   - **ระวัง print:** หน้า Dashboard มี print/export (`executive-report-no-print` class ใช้ซ่อนตอนพิมพ์) — ใส่ greeting ใน element ที่มี class `executive-report-no-print` เพื่อไม่ให้ขึ้นในรายงาน PDF
4. ห้ามแตะ logic ฟิลเตอร์/กราฟ/URL-sync ใดๆ ในไฟล์นี้

### 3.2 การ์ด "รอบบริการที่กำลังมาถึง"
1. API ที่ใช้ (มีอยู่แล้ว): `searchServiceCalendars` จาก `@/services/api/ServiceCalendarApi`
   - ดูวิธีเรียกจริงใน `src/pages/officer/sample-receiving/SampleReceivingManagement.tsx` (เรียกด้วย `{ year, month, all: true }` ได้ `{ data: CalendarInfoInterface[] }`)
   - เช็ค shape จริงที่ `src/types/ServiceCalendar.ts` ก่อน render — field ที่คาดว่ามี: `serviceCalendarId`, `date`, `bus` (busNumber/busName/licensePlate) และความสัมพันธ์พื้นที่ (อ่าน type จริง อย่าเดา)
2. ดึงปฏิทินของเดือนปัจจุบัน + เดือนถัดไป (เรียก 2 ครั้งหรือครั้งเดียวตามที่ API รับ) แล้ว filter `date >= วันนี้` เรียงใกล้สุดก่อน เอา 3 รายการแรก
3. Render เป็นการ์ดท้ายหน้า (หลัง Tabbed Explorer) สไตล์ mockup:
   - กล่องซ้าย: เดือนย่อ (numeric ไทย เช่น "มิ.ย.") + วันที่ตัวใหญ่ — สีตามความใกล้: ≤7 วัน = แดง (`#d9483b`/พื้น `#fceae8`), ≤14 = น้ำเงิน, อื่นๆ = เทา
   - กลาง: ชื่อ/รายละเอียดจาก field ที่มีจริง (เช่น เลขรถ + ทะเบียน)
   - ขวา: chip "อีก N วัน" (`private-chip` ใช้ได้ — แม้เป็นไฟล์ Tailwind, class CSS global ใช้ได้)
4. สถานะ loading = skeleton สั้นๆ, ว่าง = EmptyState ("ไม่มีรอบบริการที่กำลังมาถึง"), error = console.error + ไม่แสดงการ์ด
5. **"กิจกรรมล่าสุด" ของ mockup — ไม่ทำ** (ไม่มี activity-feed API) — บันทึกใน FRONTEND_PROGRESS.md ว่าเป็น blocker ที่ตัดสินใจข้ามแล้ว
6. KPI trend (+12% YoY ใน mockup) — ไม่ทำ ถ้า summary API ไม่มีข้อมูลเทียบปี (เช็ค `getFertilizerMajorLandScoreSummary` ก่อน ถ้าไม่มี = ข้าม)

### เกณฑ์ผ่าน M5
- [ ] greeting แสดงชื่อจริงจาก auth ตามช่วงเวลา และไม่ติดไปในหน้า print/PDF
- [ ] การ์ดรอบบริการแสดงข้อมูลจริงจาก backend (ทดสอบกับ dev server + backend :3000)
- [ ] ฟิลเตอร์/กราฟ/แท็บ/URL-sync เดิมทำงานครบ
- [ ] dark mode ทั้งสองส่วนไม่เพี้ยน, มือถือ 375px อ่านได้
- [ ] build + eslint ผ่าน + อัปเดต docs

---

## 4. งาน M6 — Login split-hero + QA ปิดแผน

**ไฟล์หลัก:** `src/pages/auth/login.tsx` (**อ่านไฟล์ปัจจุบันก่อน** — มี MSAL/Azure login + validation อยู่ ห้ามกระทบ)
**อ้างอิง mockup:** ส่วน `login-wrap`/`login-hero`/`login-panel` (~บรรทัด 360-440 ของ mockup)

### 4.1 โครงใหม่
```
<div class="d-flex" style="min-height:100vh">
  <div class="d-none d-lg-flex flex-column justify-content-between" style="flex:1.15; padding:46px 52px; background:..."> ← HERO
  <div class="d-flex align-items-center justify-content-center" style="flex:1; background:#fff"> ← ฟอร์มเดิมทั้งก้อน
</div>
```
- Hero gradient: `linear-gradient(160deg, #002b50 0%, #00457e 45%, #0068ba 130%)` + radial accent ตาม mockup ได้
- บนสุดของ hero: โลโก้ `/private/assets/img/mitrphol_research.webp` (กล่องขาวมุมโค้ง) + ชื่อระบบ "MITR PHOL-SOIL" + คำโปรย
- กลาง: หัวเรื่องใหญ่ 2 บรรทัด (ทำนอง "วิเคราะห์ดินแม่นยำ เพื่อผลผลิตอ้อยที่ยั่งยืน") + ย่อหน้าอธิบายระบบ
- **ตัวเลขสถิติใน hero ของ mockup (8,204 ตัวอย่าง ฯลฯ): ห้าม hardcode** — login ยังไม่ auth จึงเรียก API summary ไม่ได้ → ใช้ bullet ความสามารถระบบ (ข้อความล้วน) แทน
- ฝั่งขวา: ฟอร์ม login เดิม **ยกมาทั้งก้อนไม่แก้ logic** (ทุก field, validation, ปุ่ม MSAL/SSO ถ้ามี, error states)

### 4.2 มือถือ
- hero ซ่อนด้วย `d-none d-lg-flex` → เหลือฟอร์มเต็มจอ
- เทียบกับภาพ baseline เดิม: `C:\Users\songw\DemoBHRL\login-mobile.png` (อย่าให้แย่ลง)

### 4.3 QA ปิดแผนทั้งหมด
1. `npm run dev` (ถ้า :5173 ถูกใช้อยู่แปลว่ารันแล้ว — ใช้เลย), backend ต้องรันที่ :3000
2. Playwright MCP (ตั้ง `--browser chromium` แล้วใน `~/.claude.json`): เช็คโดยไม่ต้อง auth ได้ 2 หน้า
   - `http://localhost:5173/private/login` — desktop 1280px + mobile 375px + (toggle dark ไม่ได้เพราะปุ่มอยู่หลัง auth — ข้าม dark สำหรับ login ได้)
   - `http://localhost:5173/private/collect-sample/test-invalid-token` — 375px ต้องเห็น error card สวยงาม
3. หน้าหลัง auth: ขอให้ user ล็อกอินเอง (admin = `MordinKU`, รหัสผ่าน user กรอกเอง) แล้วไล่ดู 4 กลุ่มเมนู × light/dark × 375/768/desktop ตามเช็คลิสต์ในแผนแม่ (UI_MATCH_MOCKUP_PLAN.md ส่วน Phase 4 checklist)
4. แก้จุดเพี้ยนที่เจอเป็นรายจุด (เฉพาะหน้าตา)
5. อัปเดต docs ปิดแผน: FRONTEND_PROGRESS.md (สรุป M1-M6 ทั้งชุด) + CODEX_CONTEXT.md (ประกาศแผน Match-Mockup เสร็จสมบูรณ์ + สิ่งที่เหลือ/blockers)

### เกณฑ์ผ่าน M6
- [ ] login จอใหญ่เป็น split-hero, จอเล็กเหลือฟอร์มอย่างเดียว, ล็อกอินจริงได้ (ทดสอบกับ backend)
- [ ] ไม่มีข้อมูลปลอมบน hero
- [ ] QA sweep ผ่านเช็คลิสต์ + docs ปิดแผนครบ

---

## 5. คำสั่งที่ใช้บ่อย

```powershell
cd C:\mordin\mordin-private
npm run build                       # ต้องผ่านทุกครั้งก่อนจบงาน
npx eslint src/pages/auth/login.tsx # ตัวอย่าง lint เฉพาะไฟล์ที่แก้
npm run dev                         # dev server :5173 (ถ้า "Port in use" = รันอยู่แล้ว ใช้ได้เลย)
```
Backend (ถ้ายังไม่รัน): `cd C:\mordin\mordin-backend; npm run start:dev` (port 3000, DB = Aiven sandbox ปลอดภัย แต่ห้ามแก้ schema)

## 6. กับดักที่เจอมาแล้ว (อย่าตกซ้ำ)

1. **อ่านไฟล์ก่อนแก้เสมอ** — ไฟล์ถูก session อื่นแก้บ่อย string ที่คิดว่ามีอาจเปลี่ยนไปแล้ว
2. kaiadmin `!important` — override ไม่ติดถ้าไม่ใส่ `!important`
3. แก้ component กลาง (GuiButton/SearchAndPaginationTable/Skeleton) = กระทบ ~50 หน้า — เปลี่ยนเฉพาะ "หน้าตา" ห้ามเปลี่ยน props/behavior; ถ้าจำเป็นต้องเพิ่ม ให้เพิ่มแบบ optional (ดูตัวอย่าง `Column.searchText`)
4. เซลล์ตารางที่เปลี่ยนจาก string → ReactNode ใน SearchAndPaginationTable โหมด clientSideFilters จะค้นหาไม่เจอ — ต้องใส่ `searchText`
5. หน้า officer 4 หน้า (sample-receiving×2, qrcode, lab-result) มี `.page-header` ของตัวเอง — title กลางถูกซ่อนด้วยกฎ `:has()` แล้ว อย่าเพิ่ม title ซ้ำ
6. ฟอนต์ = Sarabun (ตัดสินใจถาวรแล้ว ไม่เปลี่ยนเป็น Noto Sans Thai)
7. prettier warnings เดิมในไฟล์ที่ไม่ได้แตะ = ปล่อยไว้ อย่า format ทั้งไฟล์ (diff จะบวม)
