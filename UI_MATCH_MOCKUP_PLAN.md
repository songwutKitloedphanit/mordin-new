# แผนปรับ mordin-private ให้ตรงกับ ui-redesign-mockup.html ให้มากที่สุด

> **Source of truth:** `C:\mordin\ui-redesign-mockup.html` (เปิดในเบราว์เซอร์เทียบได้ตลอด)
> **สถานะปัจจุบัน:** ผ่าน UI Redesign Rounds 1-6 แล้ว (ดู `setting/docs/FRONTEND_PROGRESS.md`)
> **วันที่จัดทำ:** 10 มิ.ย. 2569
> **เอกสารนี้เขียนให้ session/โมเดลใดก็ได้รับช่วงต่อ** — อ่านไฟล์นี้ + `AGENTS.md` + `CODEX_CONTEXT.md` ก่อนเริ่ม

---

## 0. กติกาตายตัว (ห้ามละเมิดไม่ว่ากรณีใด)

1. **ห้ามแตะ**: Database/schema, API contracts, `src/services/` (แก้ได้เฉพาะถ้า endpoint มีอยู่แล้ว), routes, auth/roles, สูตรปุ๋ย/เกณฑ์วิเคราะห์, vendor CSS (`src/assets/css/kaiadmin*.css`, `plugins*.css`, `demo.css`)
2. **ทุกฟีเจอร์เดิมต้องอยู่ครบ** — ห้ามลบปุ่ม/ฟอร์ม/ตาราง/ฟิลเตอร์/flow ใดๆ จัดวางใหม่ได้ ลบไม่ได้
3. **Dark mode ต้องทำงานทุกจุดที่แก้** — ทุกสไตล์ใหม่ต้องมีคู่ dark (`.private-layout-dark main ...`)
4. **มี session อื่นทำงานคู่ขนาน** (เช่น move/supersede ใน ServiceAreaEdit, public PHP mockup) — **ห้าม revert งานของคนอื่น** แตะเฉพาะส่วน "หน้าตา" ของไฟล์ที่เขาแก้
5. จบทุกรอบ: `npm run build` + `npx eslint <changed files>` ผ่าน (0 errors; warnings เดิมไม่ต้องแก้), อัปเดต `setting/docs/FRONTEND_PROGRESS.md` + `CODEX_CONTEXT.md`
6. ตรวจภาพจริงด้วย Playwright MCP (`--browser chromium` ตั้งไว้แล้ว) ที่ dev server `http://localhost:5173/private/...` — หน้า login/collect-sample เช็คได้โดยไม่ต้อง auth; หน้าใน ให้ user ล็อกอินเองแล้วดู

## 1. ผล "เช็คเทียบ" ปัจจุบัน vs mockup (gap analysis)

### ✅ ตรงแล้ว ไม่ต้องทำซ้ำ
| ส่วน | หมายเหตุ |
|---|---|
| Sidebar | flat groups + label ไทย, gradient `#005A9E→#005092→#00396A`, active = พื้นขาว+แถบทอง `#FFD45E`, โลโก้มิตรผล, footer user block + logout, mobile drawer, dark mode |
| ปุ่ม `.btn` ทุกสี | palette ใหม่ + radius 10px (override kaiadmin ใน index.css) |
| การ์ด `.private-card` | radius 14px + เงานุ่ม + header `#f7f9fc` |
| Pagination | pill + gap + active น้ำเงิน |
| ฟอร์ม input/select | radius 10px + focus ring น้ำเงิน |
| ตาราง | หัว uppercase เทา พื้น `#fafbfd` |
| สีทั้งระบบ | กวาด Kaiadmin/ครีมเก่าหมดแล้ว (Rounds 1,5,6) |
| Mobile safety net | word-break, touch target, scroll ตาราง bordered |

### ❌ ยังต่าง — นี่คืองานของแผนนี้
| # | ส่วน | mockup (อ้างบรรทัดในไฟล์ mockup) | ปัจจุบัน | ความหนัก |
|---|---|---|---|---|
| G1 | **Topbar** | แถบขาว sticky 60px: breadcrumb เล็กซ้าย (`.crumb` ~บรรทัด 113), ช่องค้นหา ⌘K กลางขวา, ปุ่มไอคอน moon/bell (`.top-icon-btn`) | Header ใหญ่ใน content: title ตัวพิมพ์ใหญ่ + breadcrumb + user pill | กลาง |
| G2 | **Page head ในเนื้อหา** | `.page-head`: title 21px bold + sub เทา + ปุ่ม action ขวา (~บรรทัด 131) | ไม่มี — title อยู่บน Header เดิม | กลาง |
| G3 | **KPI card** | `.kpi`: แถบสีซ้าย (::after), label บน + icon สี่เหลี่ยมมุมโค้งขวา, เลข 30px, บรรทัด trend (~บรรทัด 175) | icon วงกลมขวา เลข 3.5rem ไม่มี trend | กลาง |
| G4 | **ปุ่ม action ในตาราง** | `.icon-act`: 30px ขาว ขอบเทา hover เปลี่ยนสี (เงียบ) (~บรรทัด 215) | GenButtonCircle สีจัด (warning/danger/info) | กลาง |
| G5 | **Status chips** | `.chip-*`: pill พื้นอ่อนตัวเข้ม 6 สี (~บรรทัด 195) | Bootstrap badge สีทึบ | เบา (token `.private-chip-*` มีแล้วใน index.css ยังไม่ถูกใช้) |
| G6 | **Table toolbar** | `.tbl-toolbar`: ค้นหา icon-inset + selects + ตัวนับขวา ในแถวเดียว (~บรรทัด 238) | SearchAndPaginationTable: filter bar + แถว length แยก | เบา |
| G7 | **แถวตารางมี avatar + 2 บรรทัด** | `.row-avatar` + `.t-main/.t-sub` (~บรรทัด 207) | ข้อความเปล่า | เบา/ทางเลือก |
| G8 | **Flow timeline สถานะตัวอย่าง** | `.flow` 5 ขั้น เก็บ→รับ→แล็บ→ประมวล→รายงาน (~บรรทัด 300) | ไม่มี component นี้ | กลาง |
| G9 | **Scan-zone hero** | `.scan-zone` กล่อง dashed + icon ใหญ่ + CTA (~บรรทัด 320) | scanner อยู่ใน modal, หน้า receiving นำด้วย booking | กลาง |
| G10 | **Login split-hero** | ซ้าย gradient hero + ตัวเลขระบบ, ขวาฟอร์ม (~บรรทัด 390) | การ์ดกลางจอ header น้ำเงิน | กลาง |
| G11 | **Dashboard ส่วนหัว+ส่วนล่าง** | ทักทาย "สวัสดีตอนเช้า 👋", KPI มี trend, การ์ด "รอบบริการที่กำลังมาถึง" + "กิจกรรมล่าสุด" | ไม่มี greeting/trend/sections ล่าง | หนัก (มีข้อจำกัด API — ดู M5) |
| G12 | **ฟอนต์** | Noto Sans Thai | Sarabun | ตัดสินใจแล้ว: **คง Sarabun** (AGENTS.md บังคับ + ผู้ใช้คุ้น) — ข้ามถาวร |

---

## 2. รอบงาน (M1–M6) — ทำตามลำดับ แต่ละรอบจบ-review ได้อิสระ

### M1 — Topbar + Page head (G1, G2) — *ทำก่อนเพราะเปลี่ยนหน้าตาทุกหน้า*

**ไฟล์:** `src/components/layout/admin/Header.tsx`, `src/layouts/AdminLayout.tsx`, `src/index.css`

1. แปลง Header เป็น **topbar สเปค mockup**: สูง 60px, พื้น `#fff` (dark: `#20293a`), `border-bottom #e6eaf0` (dark `#3d4a5f`), `position: sticky; top: 0; z-index: 40`, padding `0 26px`
   - ซ้าย: hamburger (มือถือ — ของเดิม) + breadcrumb ขนาดเล็ก `12.5px` สี `#8b9bae` คั่น chevron, หน้า current เป็น `13.5px` หนา (ใช้ logic generateBreadcrumbs เดิม **ห้าม rewrite logic** แค่เปลี่ยน class)
   - ขวา: ปุ่มไอคอน 37×37 radius 10px ขอบ `#e6eaf0` = theme toggle (เดิม) + user pill (เดิม — **คงไว้** เพราะมีลิงก์โปรไฟล์ที่ sidebar footer ไม่มี)
   - ช่องค้นหา ⌘K ของ mockup: **ไม่ทำ** (ไม่มี global-search API; ห้าม fake) — เว้นพื้นที่ไว้เฉยๆ
2. ย้าย **pageTitle ใหญ่** จาก Header ลงเป็น `.private-page-head` ใน AdminLayout (เหนือ `<Outlet/>`): title `21px/800` + ที่ว่างให้ sub ใต้ (sub ปล่อยว่างได้ ไม่บังคับทุกหน้า)
   - AdminLayout ต้องเปลี่ยน: `<main>` ไม่หุ้ม padding รวม Header อีกต่อไป — Header เต็มกว้าง sticky, ส่วน content ค่อย padding `24px 26px`
3. CSS ใหม่ลง index.css block "M1": `.private-topbar`, `.private-topbar-crumb`, `.private-topbar-icon-btn` + dark twins
4. **เกณฑ์ผ่าน:** ทุกหน้า (เปิดผ่าน user ล็อกอิน) เห็น topbar ขาวบาง + title ใหญ่ในเนื้อหา; มือถือ 375px hamburger ใช้ได้; dark mode ไม่เพี้ยน; build ผ่าน

### M2 — KPI card + chips + icon-act (G3, G4, G5) — *กระทบทุกหน้า list/summary*

**ไฟล์:** `src/index.css` + summary-card components + GuiButton

1. **KPI**: เพิ่ม class `.private-kpi` ตามสเปค mockup (แถบซ้าย 4px ด้วย `--kpi-c`, label `12.5px/600` เทา, icon 38×38 radius 10px พื้นสีอ่อน `color-mix(... 12%)`, เลข `30px/800 letter-spacing -1px`, slot `.private-kpi-trend` `11.5px`)
   - ปรับ component ที่วาด KPI ซ้ำๆ ให้ใช้ class นี้: `SampleReceivingSummaryCard`, `QRCodeSummaryCard` (2 ที่), `LabResultSummaryCard`, `UserManagementSummaryCard`, `ShopSummaryCard`, `BusSummaryCard`, `FertilizerPriceSummaryCard`, `FertilizerUsagesSummaryCard`, `AnalysisReportSummaryCard`, `ServiceCalendarCard` + KPI inline ใน `SampleReceivingManagement`, `ServiceAreaAdd/Edit/Management`, `Land*`, `Laboratory*`, `qrcode.tsx`, `StandardManagement`, `Shop*`, `Bus*`
   - ทำเป็น **shared component ใหม่** `src/components/ui/KpiCard.tsx` (Bootstrap-based, props: label, icon, accent, value, unit, trend?, loading?) แล้วให้ไฟล์ข้างบนเรียกใช้ — ลดโค้ดซ้ำ ~15 ไฟล์
   - trend: แสดงเฉพาะที่มีข้อมูลจริงอยู่แล้ว (เช่น "รอผลแล็บ X") — **ห้ามใส่ +12% ปลอม**
2. **Chips**: ใช้ `.private-chip .private-chip-{green|amber|red|blue|gray|violet}` (มีแล้วใน index.css ตั้งแต่ R1) แทน `badge bg-*` ในเซลล์สถานะของ: SampleReceivingManagement (สถานะรับ), QRCodeManagement, LabResult, AnalysisReport, FarmerManagement, LandManagement ฯลฯ — ไล่จาก `grep -r "badge bg-" src/pages src/components/pages`
3. **icon-act**: เปลี่ยนสไตล์ `GenButtonCircle` ผ่าน CSS เท่านั้น (ไม่แก้ API ของ component):
   ```css
   /* in index.css — quiet table actions per mockup .icon-act */
   main .btn.btn-icon.btn-round { width:32px;height:32px;background:#fff!important;
     border:1px solid #e2e8f0!important;color:#51637a!important;box-shadow:none; }
   main .btn.btn-icon.btn-round:hover { background:#f3f5f8!important; }
   main .btn.btn-icon.btn-round.btn-danger:hover { background:#fceae8!important;color:#c2372b!important;border-color:#f5cdc8!important; }
   main .btn.btn-icon.btn-round.btn-warning:hover { color:#b3760a!important;background:#fdf3dd!important;border-color:#f1ddae!important; }
   main .btn.btn-icon.btn-round.btn-info:hover, main .btn.btn-icon.btn-round.btn-primary:hover { color:#005092!important;background:#e7f1fb!important;border-color:#cce0f5!important; }
   /* ยกเว้นปุ่ม "เพิ่ม" ในหัวการ์ดให้คงเขียวเด่น */
   main .private-card-header .btn.btn-icon.btn-round.btn-success { background:#18a05c!important;color:#fff!important;border-color:#18a05c!important; }
   ```
   + dark twins (`background:#263247`, border `#3d4a5f`, text `#aeb8c8`)
4. **เกณฑ์ผ่าน:** หน้า list ตัวแทน 3 หน้า (farmer, sample-receiving, qrcode) หน้าตา KPI/chips/ปุ่ม ตรง mockup; dark โอเค; build ผ่าน

### M3 — Table toolbar + avatar rows (G6, G7)

**ไฟล์:** `src/components/gui/SearchAndPaginationTable.tsx`, `src/index.css`

1. toolbar: ช่องค้นหาใส่ icon แว่นแบบ inset (background-image SVG ตาม mockup `.input-search`), ย้าย length selector มารวมแถวเดียวกับ filter bar (ขวาสุด พร้อมตัวนับ "แสดง X-Y จาก Z"), ลบแถวแยกอันเดิม — **props/behavior ห้ามเปลี่ยน**
2. avatar rows (ทางเลือก ทำเฉพาะ 2 หน้า impact สูง): FarmerManagement, UserManagement — คอลัมน์ชื่อเป็น `avatar วงกลมสีจาก hash ชื่อ + ชื่อหนา + บรรทัดรองเทา (เบอร์โทร/username)`; ทำ helper `src/components/ui/RowAvatar.tsx`
3. **เกณฑ์ผ่าน:** ตารางทุกหน้าที่ใช้ SearchAndPaginationTable ได้ toolbar ใหม่อัตโนมัติ; sort/filter/pagination ทำงานเหมือนเดิมเป๊ะ (ทดสอบจริงกับ backend)

### M4 — Flow timeline + Scan-zone (G8, G9) — *Operations*

**ไฟล์ใหม่:** `src/components/ui/SampleFlow.tsx` — render 5 ขั้นตาม mockup `.flow` (props: `current: 'collected'|'received'|'analyzing'|'analyzed'|'approved'`) จับคู่กับ `SampleStatusEnum` ที่มีอยู่
1. ใส่ใน `SampleReceivingInfo` (บนสุดใต้ page head) และ `AnalysisReportInfo` — แสดงสถานะจริงจากข้อมูลที่หน้านั้นโหลดอยู่แล้ว
2. **Scan-zone**: ใน `SampleReceivingManagement` เพิ่มการ์ด scan-zone สไตล์ mockup (กล่อง dashed `#b9cde3` + icon 74px + ปุ่ม "เปิดกล้องสแกน") เหนือ section booking — ปุ่มเปิด `PairingScannerModal` เดิมในโหมด walk-in (นำทางไป buildReceivingPath เดิม) — **booking/ตารางเดิมอยู่ครบใต้ลงไป**
3. **เกณฑ์ผ่าน:** สแกนจริงผ่าน scan-zone นำทางถูก; timeline ตรงสถานะจริงของตัวอย่างทดสอบ (`thai_id=7878787878787` มีข้อมูล); mobile 375px กดสะดวก

### M5 — Dashboard greeting + รอบบริการที่กำลังมาถึง (G11 บางส่วน)

**ไฟล์:** `src/pages/executive/Dashboard.tsx` (+ component ย่อยใหม่ใน `components/pages/executive/`)
1. เพิ่ม greeting head: "สวัสดีตอนเช้า/บ่าย/เย็น, คุณ{firstName} 👋" + sub บอกเวลาอัปเดต (เวลา fetch ล่าสุด — มีจริง)
2. การ์ด **"รอบบริการที่กำลังมาถึง"**: ใช้ `searchServiceCalendars` (มีอยู่ — SampleReceivingManagement ใช้อยู่) ดึงรายการ date >= วันนี้ 3 รายการแรก แสดงสไตล์ mockup (กล่องวันที่สี + ชื่อ + chip "อีก N วัน")
3. **"กิจกรรมล่าสุด" — ไม่ทำ**: ไม่มี activity-feed API; ห้ามสร้าง endpoint/ห้าม fake — บันทึก blocker ลง FRONTEND_PROGRESS.md
4. KPI trend บน Dashboard: ใช้เฉพาะตัวเลขที่ API summary มี (ถ้าไม่มี YoY — ไม่แสดง trend)
5. Tailwind ใช้ได้ในไฟล์นี้ (เป็นไฟล์ Tailwind-scoped เดิม)
6. **เกณฑ์ผ่าน:** dashboard แสดง greeting + upcoming rounds จากข้อมูลจริง; ฟิลเตอร์/กราฟ/แท็บเดิมครบ

### M6 — Login split-hero (G10) + QA ปิดงาน

**ไฟล์:** `src/pages/auth/login.tsx`
1. โครงตาม mockup: ≥lg แบ่งสอง (ซ้าย hero gradient `#002b50→#00457e→#0068ba` + โลโก้มิตรผล + ชื่อระบบ + ข้อความ; **ตัวเลขสถิติ hero: ไม่ใส่** เว้นแต่จะ fetch จาก endpoint summary ที่ public — ถ้าต้อง auth ให้ใช้ข้อความเฉยๆ ห้าม hardcode เลขปลอม), ขวาฟอร์ม login เดิมทุก field/validation/MSAL
2. มือถือ: hero ซ่อน (`d-none d-lg-flex`) เหลือฟอร์มเต็มจอ — เทียบ screenshot เดิม `login-mobile.png` ต้องไม่แย่ลง
3. **QA สุดท้ายทั้งระบบ:** เช็คลิสต์ per-viewport (360/768/desktop × light/dark): login, collect-sample (token ปลอม), แล้วให้ user ล็อกอินไล่ 4 กลุ่มเมนู; แก้จุดเพี้ยนรายจุด; build + eslint; อัปเดต docs ปิดแผน

---

## 3. ลำดับความสำคัญถ้าโทเค็น/เวลาจำกัด

`M1 → M2 → M3` ให้ผลตา-เห็นมากสุด (ทุกหน้า) | `M4` คุณค่างานสนาม | `M5, M6` ความหรูท้ายสุด
แต่ละ M จบในตัว — หยุดที่ M ไหนระบบก็ยังสมบูรณ์ใช้งานได้

## 4. บันทึกสำหรับผู้รับช่วง

- token classes ที่มีอยู่แล้วใน `src/index.css` (ค้นคำว่า "Round-1"/"Round-2"/"Round-3"/"Round-4"): `.private-chip-*`, `.private-icon-btn`, `.private-page-head`, ปุ่ม/ตาราง/ฟอร์ม overrides — **อย่าประกาศซ้ำ ให้ต่อยอด**
- kaiadmin ใช้ `!important` — override ต้องใช้ `!important` เช่นกัน และ scope light ด้วย `.private-layout-root:not(.private-layout-dark) main`
- ห้ามใส่ Tailwind ในไฟล์ Bootstrap (กติกา AGENTS.md); Tailwind ใช้ได้เฉพาะ executive Dashboard + components/ui + layout เดิมที่เป็น Tailwind
- ทดสอบจริง > mock เสมอ (กติกาโปรเจกต์): ใช้ dev server + backend จริง (port 3000) + Playwright MCP (`--browser chromium`)
- creds: admin `MordinKU` — รหัสผ่านต้องให้ user กรอกเอง; farmer ทดสอบ read-only: `thai_id=7878787878787`, `phone=0987878787`, `landId=80`
