# Frontend Progress - Mordin Public UI Modernization

## Overview
- Date: 2026-06-15
- Task: Fix Render migration crash, resolve missing qr_codes.birth_date database column, and enhance dashboard summary error visibility.

### What Was Done
1. **Conditional Migration Execution**:
   - Updated `mordin-backend/migrations/20260615_add_fertilizer_land_scores_main.sql`.
   - Replaced raw `CREATE TABLE` and `ALTER TABLE ADD CONSTRAINT` statements with PL/pgSQL `DO $$ BEGIN IF NOT EXISTS ... END $$;` blocks.
   - This prevents deployment failures on Render when the database relations or constraints are already present.
2. **Added birth_date Column Migrations**:
   - Created `20260615_add_birth_date_to_qr_codes_main.sql` to add `birth_date` to the main database `qr_codes` table.
   - Created `20260615_add_birth_date_to_qr_codes_logs.sql` to add `birth_date` to the logs database `qr_codes_logs` table.
   - Created corresponding rollback SQL scripts for both.
3. **Backend Error Capture**:
   - Updated `mordin-backend/src/sample/fertilizer-major-land-scores/fertilizer-major-land-scores.service.ts`.
   - Wrapped database find query in `getSummaryCards()` in a `try-catch` block.
   - Configured it to log and throw `InternalServerErrorException` with the specific database driver error.
3. **Frontend Error Display**:
   - Updated `mordin-private/src/components/pages/executive/dashboard/DashBoardCard.tsx`.
   - Configured `DashboardSummary` component to fetch and render the specific server-side error string when it fails to load the dashboard KPIs. Swapped priority of `data.message` and `data.error` to render the actual DB driver message instead of the generic "Internal Server Error" status string.

### Files Changed
- `mordin-backend/migrations/20260615_add_fertilizer_land_scores_main.sql` (Modified)
- `mordin-backend/src/sample/fertilizer-major-land-scores/fertilizer-major-land-scores.service.ts` (Modified)
- `mordin-private/src/components/pages/executive/dashboard/DashBoardCard.tsx` (Modified)

### Commands Run
- `npm run build` in `mordin-backend` (Passed)
- `npm run build` in `mordin-private` (Passed)
- Pushed changes to `songwutKitloedphanit/mordin-new` to trigger Render build.

---

## Overview
- Date: 2026-06-15
- Task: Adjust private login logo and remove its wrapper background.

### What Was Done
1. **Adjusted Login Logo Presentation**:
   - Updated `mordin-private/src/pages/auth/login.tsx`.
   - Increased the compact login brand logo from 46px to 54px.
   - Removed the white rounded wrapper background, shadow, clipping, and radius around the logo so the image sits directly on the page.

### Files Changed
- `mordin-private/src/pages/auth/login.tsx` (Modified)

### Commands Run
- `npm run build` in `mordin-private` (passed; Vite reported the existing large chunk warning).

---

## Overview
- Date: 2026-06-15
- Task: Fix missing citizen ID display in private sample receiving after using existing farmer data.

### What Was Done
1. **Fixed Sample Receiving Table Fallbacks**:
   - Updated `mordin-private/src/pages/officer/sample-receiving/SampleReceivingManagement.tsx`.
   - Identified that the returning/existing-data flow links the QR book to an existing farmer, so the citizen ID is available at `book.farmer.thaiNationalId` instead of `qrCode.thaiNationalId`.
   - Added display helpers so the waiting-to-receive table uses `qrCode.thaiNationalId` first, then falls back to `book.farmer.thaiNationalId`.
   - Added the same fallback style for land code, using `book.land.landCode` when the flat QR field is empty.

### Files Changed
- `mordin-private/src/pages/officer/sample-receiving/SampleReceivingManagement.tsx` (Modified)

### Commands Run
- `npm run build` in `mordin-private` (passed; Vite reported the existing large chunk warning).

### Remaining Issues
- Search results are still supplied by the existing `/qr-codes` API contract. This change fixes display only and does not alter backend search behavior.

---

## Overview
- Date: 2026-06-12
- Task: Fix MapPicker "AuthFailure" API key issue and move map to the left side of the screen.

### What Was Done
1. **Replaced MapPicker Component**:
   - Updated `mordin-private/src/pages/officer/sample-receiving/CollectionWizardModal.tsx`.
   - Switched from the Google Maps `MapPicker` (which was causing an API Key `AuthFailure`) to `LeafletMapPicker`, which leverages OpenStreetMap and Leaflet and works without requiring an API key.
2. **Moved Map to Left Column**:
   - Re-organized the layout in step 3 (Land) of the wizard modal.
   - Moved the Map rendering block from `col-lg-7` (Right side / Land Form) to `col-lg-5` (Left side / Land Candidates) below the "ตรวจแปลงเดิมของเกษตรกร" section.

### Files Changed
- `mordin-private/src/pages/officer/sample-receiving/CollectionWizardModal.tsx` (Modified)

---

## Overview

### What Was Done
1. **Added MapPicker to CollectionWizardModal**:
   - Updated `mordin-private/src/pages/officer/sample-receiving/CollectionWizardModal.tsx`.
   - Replaced the two separate `TextField` inputs for Latitude and Longitude with the reusable `MapPicker` component.
   - Handled `MapPicker`'s `location`, `setLocation`, and error states.
   - Wired up the state changes so dropping a pin on the map correctly maps back to `landForm.latitude` and `landForm.longitude`.

### Files Changed
- `mordin-private/src/pages/officer/sample-receiving/CollectionWizardModal.tsx` (Modified)

---

## Overview

### What Was Done
1. **Fixed Public Collect Sample Payload**:
   - Updated `mordin-public/src/pages/collect-sample.php`.
   - Identified that `areaSize`, `subdistrictCode`, and `zipCode` inputs filled by the farmer were ignored by the PHP `POST` handler and not included in `$formData`.
   - Modified the POST handler to explicitly extract these variables using `filter_var` and attach them to `$formData` before submitting to the backend API (`updateDataByFarmer`). This ensures the private Receiving flow accurately auto-populates the fields in the wizard modal based on what the farmer entered.

### Files Changed
- `mordin-public/src/pages/collect-sample.php` (Modified)

---

## Overview

### What Was Done
1. **Fixed Address Cascading Derivation**:
   - Updated `buildLandForm` in `mordin-private/src/pages/officer/sample-receiving/CollectionWizardModal.tsx`.
   - When scanning QR Codes, the backend payload may only provide a flat `subdistrictCode` without sending nested `district` and `province` objects.
   - Implemented logic to automatically derive the `provinceId` (first 2 digits) and `districtId` (first 4 digits) from the 6-digit `subdistrictCode`. This ensures that the cascading `useEffect` triggers correctly load and auto-select the matching dropdown options for Province, District, and Subdistrict.
2. **Fixed Area Size and Quota Code Parsing**:
   - Ensured `areaSize` defaults to an empty string `""` instead of `"undefined"` when the QR data lacks area dimensions.
   - Automatically pre-filled `quotaCode` with the farmer's `thaiFarmerId` as a fallback when the QR payload doesn't explicitly declare a quota code.

### Files Changed
- `mordin-private/src/pages/officer/sample-receiving/CollectionWizardModal.tsx` (Modified)

### Commands Run
- `npm run build` (Ensured zero TypeScript errors)

---

## Overview

### What Was Done
1. **Centered Segment Tabs**:
   - Modified [report-land.php](file:///c:/mordin/mordin-public/src/pages/services/service-reports/report-land.php) by moving `.public-farmer-toolbar` inside the `.container` of the main `public-report-page` section, removing the `.container-fluid` wrapper. This correctly applies the flexbox centering (`justify-content: center`) directly to the segment tabs so they perfectly align with the center of the page content, matching the layout on the `farmer.php` page.

### Files Changed
- `mordin-public/src/pages/services/service-reports/report-land.php` (Modified)

### Commands Run
- Edited file and verified CSS layouts against references.

---

## Overview
- Date: 2026-06-12
- Task: Implement soil sample collection stepper wizard popup in Private app.

### What Was Done
1. **Created CollectionWizardModal Component**:
   - Developed [CollectionWizardModal.tsx](file:///c:/mordin/mordin-private/src/pages/officer/sample-receiving/CollectionWizardModal.tsx) to handle adding missing farmers and lands in-place.
   - Designed a responsive visual stepper indicating the current stage: `ตรวจสอบ QR` → `เกษตรกร` → `แปลงปลูก` → `พร้อมรับตัวอย่าง`.
   - Structured a two-column modal layout: the left column acts as a static reference panel showing the scanned QR details (along with a Leaflet Map preview with fallback notifications for missing/invalid coordinates), while the right column houses the active step's form fields.
   - Auto-populated farmer and land form details directly from the scanned QR values.
   - Added a `วันเดือนปีเกิด` (Birth Date) field to the farmer form. Checked that the backend supports this on the `Farmer` entity, DTO, and DB schema.
   - Initialized address cascading dropdowns (Province → District → Subdistrict → Zip Code) automatically from the QR code's book details.
   - Connected `createFarmer`, `createLand`, and `settingOwnerData` APIs to persist new records and link them to the book.
   - Added a new Step 4 success screen (`พร้อมรับตัวอย่าง`) summarizing completion.
   - Added `X` close buttons at the top-right and clear `ยกเลิก` buttons on the footer of all steps to discard changes.
2. **Updated SampleReceivingInfo Integration**:
   - Modified [SampleReceivingInfo.tsx](file:///c:/mordin/mordin-private/src/pages/officer/sample-receiving/SampleReceivingInfo.tsx) to import `CollectionWizardModal` and manage its open/step states.
   - Updated the "Add Farmer" button click handler to launch the wizard starting at Step 2 (Farmer details).
   - Updated the "Add Land" button click handler to launch at Step 3 (Land details) if the farmer already exists, or force-start at Step 2 (Farmer details) to first link a farmer.
   - Set up the success callback to invoke `fetchQrCode()` on the parent page to automatically refresh and reload the linked cards.
3. **Tested and Verified Code Quality**:
   - Verified that the build compiled successfully using `npm run build`.
   - Resolved all TypeScript typings and formatting warnings using `npm run lint` and `npm run lint:fix`.

### Files Changed / Created
- `mordin-private/src/pages/officer/sample-receiving/CollectionWizardModal.tsx` (New)
- `mordin-private/src/pages/officer/sample-receiving/SampleReceivingInfo.tsx` (Modified)

### Commands Run
- `npm run build` (Production build compiles successfully)
- `npm run lint` and `npm run lint:fix` (Codebase is 100% clean of errors and warnings in our files)

---

## Overview
- Date: 2026-06-11
- Task: Fix public header profile button contrast and mobile navigation layout bugs.

### What Was Done
1. **Public Desktop Header Profile Toggle Style**:
   - Changed `.public-profile-toggle` on scrolled/white headers (`body:not(.page-home) .ag-header`, `body.page-home .ag-header.scrolled`) from a low-contrast white outline style to a premium blue button matching the registration CTA (`var(--ag-blue)` background, white text, white chevron arrow, and white circular avatar with blue letter).
   - Unified conflicting/duplicate styling blocks within `assets/css/main.css`.
2. **Mobile Menu Link Contrast Bug**:
   - Fixed invisible navigation link text on mobile (`body.mobile-nav-active`) by setting a high-contrast dark color (`var(--mp-heading)`) and correct hover/active states, preventing the white text rule from transparent headers from overriding it on white mobile menu containers.
3. **Mobile User Profile Toggle Styling**:
   - Adjusted the mobile user profile container (`.mobile-nav-profile-link`) to have a clean blue border (`1.5px solid var(--mp-blue)`), light background, and centered layout.
   - Styled the avatar circle inside the mobile user profile box to be a solid blue circle with high-contrast white text for the user initial, and set the user display name text color to dark.

### Files Changed / Created
- `mordin-public/assets/css/main.css` (Modified)

### Commands Run
- Edited `assets/css/main.css` and verified syntax.

---

## Overview
- Date: 2026-06-11
- Task: Fix factories and promotion zones not loading on the registration/booking page of the public PHP site.

### What Was Done
1. **Identified the Connection Blockers**:
   - The NestJS backend server was not running. Started it using `npm run start:dev` inside the `mordin-backend` directory.
   - The public PHP web server was attempting to connect to `localhost:3000`. On local systems, PHP curl resolves `localhost` to IPv6 `[::1]`. However, the NestJS backend only listens on IPv4 (`0.0.0.0`), leading to silent curl connection failures.
2. **Fixed Hostname IPv6 Resolution Issue**:
   - Modified `mordin-public/.env` to define `API_BASE_URL` using `127.0.0.1:3000` instead of `localhost:3000`.
   - Updated the fallback URL in `mordin-public/index.php` and `mordin-public/src/config/config.php` to use `127.0.0.1:3000` as well, ensuring stable IPv4 routing and avoiding connection timeouts.
3. **Hardened API Error Visibility**:
   - Modified `ApiClient.php`'s request function to log curl errors and API error codes using `error_log`, preventing curl connection errors from being silently swallowed and hidden in future development/production rounds. Kept logs safe and clean without logging response bodies.
4. **Verified**:
   - Confirmed that the register page `http://localhost:8080/services/book/register` successfully loads the list of factories.
   - Confirmed that other pages (like upcoming calendar and status tracker) also load correctly from the backend.

### Files Changed / Created
- `mordin-public/.env` (Modified)
- `mordin-public/index.php` (Modified)
- `mordin-public/src/config/config.php` (Modified)
- `mordin-public/src/services/ApiClient.php` (Modified)

### Commands Run
- Started backend via `npm run start:dev` inside `mordin-backend`.
- Started PHP server via `C:\xampp\php\php.exe -S localhost:8080 -t C:\mordin\mordin-public`.
- Verified via `Invoke-WebRequest` and checked PHP server logs.

---

## Overview
- Date: 2026-06-11
- Task: Fix molecule background canvas animation timing and layout sizing bug in Firefox, Edge, and Opera.

### What Was Done
1. **Identified the Canvas Timing Bug**:
   - In Firefox, Edge, and Opera, when a script calls `requestAnimationFrame(initCanvas)` during parsing, it runs *before* the browser has computed the stylesheet layout and styles. This caused the canvas size to be calculated as `1x1` pixels.
   - The particles were generated and drawn in this tiny `1px` clump, rendering them invisible.
   - If a user has "Animation effects" turned off in their Windows/OS accessibility settings, the browser evaluates `prefers-reduced-motion: reduce` as `true`. In this state, the canvas animation loop never runs, so the 1px particle clump is never resized or redrawn even after layout completes.
2. **Implemented Window Load Event Listener**:
   - Modified [home.php](file:///c:/mordin/mordin-public/src/pages/home.php) to check if `document.readyState === 'complete'` before calling `initCanvas()`, otherwise registering a listener for the window `'load'` event.
   - This ensures that stylesheet computations are fully finalized and the canvas is sized to its correct full-screen dimensions (e.g. 1920x1080) before drawing.
   - Ensured that if the user's OS has disabled animations (`reduceMotion === true`), the static particles are still generated and drawn across their correct, spread-out positions on the full-screen canvas instead of clumping.
   - Ensured that previous animations are properly cleaned up by calling `cancelAnimationFrame(animId)` before starting a new loop in `initCanvas`.

### Files Changed / Created
- `mordin-public/src/pages/home.php` (Modified)
- `public-home-antigravity-mockup.html` (Modified)

### Commands Run
- `Select-String` and `Get-ChildItem` to search for canvas references.

---

## Overview
- Date: 2026-06-11
- Task: Update sidebar logo and login page logo in Private app to use a real white image instead of CSS filter, and remove the white background box.

### What Was Done
1. **Copied White Logo Asset**:
   - Copied `logo-mitr-phol-white.png` from `mordin-public/assets/img/` to `mordin-private/public/assets/img/logo-mitr-phol-white.png`.
2. **Updated Private Sidebar Logo**:
   - Modified [Sidebar.tsx](file:///c:/mordin/mordin-private/src/components/layout/admin/Sidebar.tsx) to use the new white logo image `/private/assets/img/logo-mitr-phol-white.png` directly, removing the white background wrapper and the CSS filter (`brightness(0) invert(1)`).
3. **Updated Login Page Logo**:
   - Modified [login.tsx](file:///c:/mordin/mordin-private/src/pages/auth/login.tsx) to add the CSS styling `.private-login-hero-logo-white` (removing the white background card and shadow).
   - Used the white logo image `logo-mitr-phol-white.png` on the dark blue login hero sidebar for desktop screens, while keeping the mobile view logo unchanged to ensure visibility on the white background.
4. **Verified Build**:
   - Ran `npm run build` in `mordin-private` to confirm the React app builds successfully.

### Files Changed / Created
- `mordin-private/public/assets/img/logo-mitr-phol-white.png` (New file copied)
- `mordin-private/src/components/layout/admin/Sidebar.tsx` (Modified)
- `mordin-private/src/pages/auth/login.tsx` (Modified)

### Commands Run
- `npm run build` inside `mordin-private` (Build completed successfully)

---

## Overview
- Date: 2026-06-11
- Task: Relocate Dashboard filters to the top-right, integrate the regional SVG soil nutrient map card inside the Dashboard page, and create the redesigned "รายงานผู้บริหาร" (Executive Reports) page with interactive report category cards that toggle detailed summaries below.

### What Was Done
1. **Refined Sidebar Logo**:
   - Removed the white background box, border-radius, and shadow from the sidebar logo container (`.sb-logo-mark`).
   - Styled the seedling icon directly in white (`#ffffff`) with an increased font size (`24px`).
2. **Relocated Dashboard Filters**:
   - Moved the Year select and Factory select dropdowns to the top-right header area in `#page-dashboard`, styling them as clean bordered dropdowns.
   - Refactored the export button to read "ส่งออกรายงาน" with the `fa-file-export` icon.
2. **Merged Map into Dashboard Page**:
   - Merged the interactive regional SVG map of Thailand (with regions and sugar factory marker click actions) directly into the bottom of `#page-dashboard`.
   - Adapted hover tooltips and selection stats side panel to function seamlessly within the dashboard context.
   - Removed the separate standalone map page from the sidebar menu.
3. **Created Executive Reports Page**:
   - Added a new sidebar item "รายงานผู้บริหาร" under "หน้าหลัก".
   - Created the `#page-exec-reports` page view matching Screenshot 2, with matching top-right filters and 3 large category cards (Soil Analysis Overview, Fertilizer Summary, Soil Nutrient Map).
4. **Implemented Interactive Details Toggles**:
   - Added toggleable detail cards that slide open below the reports cards when clicked:
     - **Soil Analysis Overview detail**: Displays overall certificate/acreage stats and a regional soil OM/pH distribution table.
     - **Fertilizer Recommendation Summary detail**: Computes simulated fertilizer tonnage targets (16-8-8, 15-15-15, 13-13-21) and displays a factory-wise purchase table.
     - **Soil Nutrient Map detail**: Embeds another interactive SVG map instance focused on spatial report analytics.
     - Collapsing functions let user click a card again or use a dedicated "ปิดรายงาน" button to close the panel.
5. **Tested and Verified Build**:
   - Verified map and toggle JS handlers operate cleanly in Light and Dark themes.
   - Ran `npm run build` inside `mordin-private` to confirm the React app compile status is 100% successful.

### Files Changed / Created
- `dashboard-reports-redesign.html` (Relocated filters, merged map, new interactive executive reports page)
- `FRONTEND_PROGRESS.md` (Prepend this update)
- `CODEX_CONTEXT.md` (Updated codex log)

### Commands Run
- `npm run build` inside `mordin-private` (Build completed successfully)

---

## Overview
- Date: 2026-06-11
- Task: Redesign and create a high-fidelity unified Dashboard & Reports mockup matching the Noto Sans Thai UI guidelines of ui-redesign-mockup.html.

### What Was Done
1. **Audited UI Redesign Guidelines (`ui-redesign-mockup.html`)**:
   - Extracted core design tokens: brand navy (`#005092`), slate, green, amber, red, and violet alerts, Noto Sans Thai typography, and button/card border tokens.
   - Identified the sidebar sections: หน้าหลัก, การจัดการข้อมูล, งานปฏิบัติการ, ตั้งค่าระบบ, and the navigation/crumb layout.
2. **Created Redesigned HTML Mockup (`dashboard-reports-redesign.html`)**:
   - **Mitr Phol Branding Style**: Implemented the exact gradient sidebar background, logo badge, crumbs path, and topbar layouts from the redesigned Private React guidelines.
   - **Interactive Multi-view Shell**: Integrated Dashboard view, Soil Nutrient Map view (Thailand SVG regions & factory markers), Scanned Sample Receiving view, Lab Result grid, and Reports Center view into one responsive layout.
   - **Premium Soil Certificate Drawer**: Added a slide-over panel simulating the official Mitr Phol Soil Certificate, displaying NPK/pH pointer scales, crop yield scores, and star-rated fertilizer recommendations.
   - **Interactivity**: Simulated search filtering, status counts, tab switches for soil nutrient charts, region click details on the map, checkbox selections, and batch approval commands.
   - **Theme & Responsiveness**: Supported Light/Dark mode toggling and grid layouts suited for desktop.

### Files Changed / Created
- `dashboard-reports-redesign.html` (New mockup)
- `FRONTEND_PROGRESS.md` (Updated progress log)
- `CODEX_CONTEXT.md` (Updated codex context)

### Commands Run
- `npm run build` in `mordin-private` (To verify build integrity)

## Overview
- Date: 2026-06-11
- Task: Design and create a unified, premium interactive HTML mockup for the Dashboard and Reports System.


### What Was Done
1. **Audited Current Dashboard & Report System**:
   - Analyzed `mordin-private/src/pages/executive/Dashboard.tsx` (KPIs, NPK bar graphs, fertilizer formulas, soil improvement progress indicators).
   - Analyzed `mordin-private/src/pages/executive/Dashboard2.tsx` (Choropleth map of regions and provinces, and NPK charts).
   - Analyzed `mordin-private/src/pages/officer/analysis-report/AnalysisReport.tsx` (Officer panel to view, filter, approve, and batch-print/download PDF soil reports).
2. **Designed and Created Unified Premium HTML Mockup (`dashboard-reports-premium.html`)**:
   - **Modern Unified Layout**: Combined the Executive Dashboard (KPIs, NPK Bar Charts, Doughnut Charts, fertilizer tables, and conditioner stats), Spatial Soil Nutrient Map (interactive Thailand SVG map with region & factory marker click states), and Officer Reports Center (reports list table, date/factory filters, batch action buttons).
   - **Interactive Soil Certificate Drawer**: Added a slide-over panel simulating an official Mitr Phol Soil Certificate, displaying crop yield scores, chemical metrics (pH, OM, P, K with dynamic pointer scales), and star-rated fertilizer formulas.
   - **Themes & UI Polish**: Supported fully functional Light/Dark mode switching that updates chart text and borders. Implemented Sarabun (primary Thai font) & Inter (UI digits) typography with Mitr Phol branding.
   - **Interactivity**: Added custom mock actions for row selection, single approval, batch approval, batch PDF printing simulation, and search filtering.

### Files Changed / Created
- `dashboard-reports-premium.html` (New mockup)
- `FRONTEND_PROGRESS.md` (Updated progress log)
- `CODEX_CONTEXT.md` (Updated codex context)

### Commands Run
- `npm run build` in `mordin-private` (To verify build integrity)

## Overview
- Date: 2026-06-11
- Task: Centralize SweetAlert2 popup styling and convert raw `Swal.fire` calls to use centralized custom utilities.


### What Was Done
1. **Designed Centralized SweetAlert2 Theme**:
   - Styled SweetAlert2 popups (`.swal-mordin-popup`) in `mordin-private/src/index.css` to match the core Mordin design system (Sarabun font, 16px border-radius, clean card shadows, custom font sizing, and dedicated confirm/cancel button layout).
   - Styled Dark Mode SweetAlert2 themes linked with `document.body`'s `data-swal2-theme="dark"` attribute.
2. **Upgraded Swal Utility (`src/utils/swal.ts`)**:
   - Upgraded `swal.ts` to supply custom CSS class overrides (`swal-mordin-popup`, `swal-mordin-confirm`, etc.) to match the styled layout.
   - Provided standard wrapper calls: `swalSuccess`, `swalSuccessTimer`, `swalError`, `swalWarning`, `swalInfo`, `swalConfirm`, `swalConfirmDelete`, `swalLoading`, `swalClose`.
3. **Refactored Raw Swal Calls in Main Operational Pages**:
   - Refactored raw `Swal.fire` calls across 13 core files to use the updated centralized styling:
     - `src/pages/officer/sample-receiving/SampleReceivingInfo.tsx`
     - `src/pages/officer/sample-receiving/SampleReceivingManagement.tsx`
     - `src/pages/officer/analysis-report/AnalysisReport.tsx`
     - `src/pages/officer/analysis-report/AnalysisReportInfo.tsx`
     - `src/pages/officer/laboratory/LabResult.tsx`
     - `src/pages/officer/qrcode/QRCodeManagement.tsx`
     - `src/pages/admin/farmer/FarmerManagement.tsx`
     - `src/pages/admin/farmer/FarmerInfo.tsx` (also removed the leftover literal text node "Farmer Info and Map" at line 71)
     - `src/pages/admin/farmer/FarmerAdd.tsx`
     - `src/pages/admin/farmer/FarmerEdit.tsx` (also corrected success message from "เพิ่มข้อมูล" to "แก้ไขข้อมูล")
     - `src/pages/admin/land/LandManagement.tsx`
     - `src/pages/admin/land/LandAdd.tsx`
     - `src/pages/admin/land/LandEdit.tsx`

### Files Changed
- `mordin-private/src/utils/swal.ts`
- `mordin-private/src/index.css`
- `mordin-private/src/pages/officer/sample-receiving/SampleReceivingInfo.tsx`
- `mordin-private/src/pages/officer/sample-receiving/SampleReceivingManagement.tsx`
- `mordin-private/src/pages/officer/analysis-report/AnalysisReport.tsx`
- `mordin-private/src/pages/officer/analysis-report/AnalysisReportInfo.tsx`
- `mordin-private/src/pages/officer/laboratory/LabResult.tsx`
- `mordin-private/src/pages/officer/qrcode/QRCodeManagement.tsx`
- `mordin-private/src/pages/admin/farmer/FarmerManagement.tsx`
- `mordin-private/src/pages/admin/farmer/FarmerInfo.tsx`
- `mordin-private/src/pages/admin/farmer/FarmerAdd.tsx`
- `mordin-private/src/pages/admin/farmer/FarmerEdit.tsx`
- `mordin-private/src/pages/admin/land/LandManagement.tsx`
- `mordin-private/src/pages/admin/land/LandAdd.tsx`
- `mordin-private/src/pages/admin/land/LandEdit.tsx`

### Commands Run
- `npm run build` ✅ Completed successfully (built in 32.11s, no lint or compiler errors)

### Next Recommended Task
- Verify the QR collect-sample → LandAdd pre-fill flow end-to-end.
- Modernize components like `SearchModal` or other shared modals to match the styling theme.

## Overview
- Date: 2026-06-11
- Task: Fix LandAdd race condition that could overwrite QR-prefilled district/subdistrict selections.

### What Was Done
1. **Fixed race condition in LandAdd QR auto-population**:
   - `mordin-private/src/pages/admin/land/LandAdd.tsx` — Added `stateHydratingRef.current` guard to the `useEffect` for `land.provinceId` (district load) and `land.districtId` (subdistrict load). Previously, only `geocodingRef.current` guarded these auto-reset paths.
   - The problem: `geocodingRef` resets after 1s but the district/subdistrict API calls (triggered by pre-filled `provinceId`/`districtId` from QR state) could take longer. When they completed after the 1s reset, `subdistrictCode` would be overwritten with the first option in the list.
   - The fix: `stateHydratingRef` now also guards both auto-reset paths and stays `true` for 3s (vs `geocodingRef`'s 1s), giving district/subdistrict API calls time to finish before the guard clears.
2. **Verified existing work**: Confirmed that prior session changes (Header profile button removed, sidebar profile shows name+role, farmer avatar hidden, card-type selector removed) are all in place and working.

### Files Changed
- `mordin-private/src/pages/admin/land/LandAdd.tsx` (Modified — guards in district/subdistrict useEffects, decoupled geocodingRef/stateHydratingRef timeouts)

### Commands Run
- `npm run build` ✅ Completed successfully (2527 modules, no TypeScript errors)

### Remaining Issues
- `FarmerInfo.tsx` has a leftover literal text node `Farmer Info and Map` at line 71 (cosmetic only, not breaking)
- `FarmerInfo.tsx` still uses old DataTable pattern (not modernized yet)
- LandAdd does not pass `farmerId` in the navigate state when going from Farmer pages — user must search for farmer manually in those entry points

### Next Recommended Task
- Verify the QR collect-sample flow end-to-end to confirm the LandAdd pre-fill works correctly
- Consider modernizing `FarmerInfo.tsx` to match the Bootstrap 5 pattern used in other pages



## Overview
- Date: 2026-06-11
- Task: Remove card type selector and implement unified Citizen ID / Farmer ID input in edit and add farmer pages.

### What Was Done
1. **Removed Card Type Selection in Add/Edit Farmer Pages**:
   - Modified `src/pages/admin/farmer/FarmerEdit.tsx` and `src/pages/admin/farmer/FarmerAdd.tsx` to remove the card type radio buttons ("ประเภทบัตร").
2. **Unified ID Input and Auto-Detection**:
   - Changed both forms to bind the input field directly to a local `inputCardId` state.
   - Updated form submission to auto-detect whether the input is a Thai National ID (Citizen ID) or a Farmer ID based on the input length (exactly 13 digits maps to `thaiNationalId`, any other length maps to `thaiFarmerId`).
3. **TypeScript Cleanup**:
   - Removed the unused `cardType` and `setCardtype` states to prevent compilation failures.

### Files Changed / Created
- `mordin-private/src/pages/admin/farmer/FarmerEdit.tsx` (Modified)
- `mordin-private/src/pages/admin/farmer/FarmerAdd.tsx` (Modified)

### Commands Run
- `npm run build` (Completed successfully)

### Next Recommended Task
- Continue with UI/UX adjustments or other modernization requests.

## Overview
- Date: 2026-06-11
- Task: Remove farmer avatar icons and phone numbers under names, and restore an Edit button on the Farmer list page.

### What Was Done
1. **Removed Farmer Avatar Circles**:
   - Modified `src/components/gui/RowAvatar.tsx` to support a `hideAvatar` boolean prop.
   - Updated `src/pages/admin/farmer/FarmerManagement.tsx` to pass `hideAvatar` to the name column's `RowAvatar` rendering, hiding the circular letter avatars.
2. **Removed Phone Numbers under Names**:
   - Removed the `sub` prop from `RowAvatar` in the farmer name column in `FarmerManagement.tsx`, hiding the phone number sub-text from under the farmer names.
3. **Restored Edit Action Button**:
   - Added a direct Edit button (pencil icon) linking to `/admin/farmer/:id/edit` in the "จัดการ" (Manage) column actions in `FarmerManagement.tsx` so users can still edit farmer details since the info/profile page was removed.

### Files Changed / Created
- `mordin-private/src/components/gui/RowAvatar.tsx` (Modified)
- `mordin-private/src/pages/admin/farmer/FarmerManagement.tsx` (Modified)

### Commands Run
- `npm run build` (Completed successfully)

### Next Recommended Task
- Continue with UI/UX adjustments or other modernization requests.

## Overview
- Date: 2026-06-11
- Task: Remove farmer profile view button from the Farmer list page.

### What Was Done
1. **Removed Farmer Profile Info Link**:
   - Modified `src/pages/admin/farmer/FarmerManagement.tsx` to remove the profile view/info button (`i` icon) under the "จัดการ" (Manage) column in the farmer data table.

### Files Changed / Created
- `mordin-private/src/pages/admin/farmer/FarmerManagement.tsx` (Modified)

### Commands Run
- `npm run build` (Completed successfully)

### Next Recommended Task
- Continue with UI/UX adjustments or other modernization requests.

## Overview
- Date: 2026-06-11
- Task: Remove top-right user profile dropdown and the profile route, preserving the bottom-left profile details.

### What Was Done
1. **Removed Top-Right User Profile Dropdown**:
   - Modified `src/components/layout/admin/Header.tsx` to remove the user profile dropdown button (containing user initials, name, and menu toggle) from the top-right corner.
   - Cleaned up all associated states, handlers (outside click click-listeners), and imports (`useAuth`, `useMemo`, `useRef`, `useState`, `NavLink`) to maintain a clean codebase and avoid linting warnings.
2. **Removed Profile Page and Route**:
   - Modified `src/App.tsx` to remove the `/profile` page route (`<Route path="profile" element={<Profile />} />`) and the import statement for the `Profile` component, removing the profile management view.
3. **Preserved Bottom-Left Sidebar Profile**:
   - Kept the bottom-left profile footer widget showing user initials, name, and role text intact in `src/components/layout/admin/Sidebar.tsx` as requested by the user, ensuring the user details are displayed correctly on the sidebar.

### Files Changed / Created
- `src/components/layout/admin/Header.tsx` (Modified)
- `src/App.tsx` (Modified)

### Commands Run
- `npm run build` (Completed successfully)

### Next Recommended Task
- Continue with UI modernization of the public site page groups or private layout operations.

## Overview
- Date: 2026-06-11
- Task: Redesign public landing page as an AI SaaS landing page with particle backdrop.

### What Was Done (Latest: Physics-Based Density-Triggered Interactive Particle System)
1. **Interactive Physics-Based Particle System (Mockup Only)**:
   - Removed the artificial, timer-based phase transitions (`DRIFT` -> `CLUSTER` -> `HOLD` -> `EXPLODE`).
   - Implemented a continuous, interactive, and organic physics sandbox in `public-home-antigravity-mockup.html`:
      - **Organic Drift**: Particles move randomly with custom drift and damping friction. Both free and bonded particles share the same drift coefficient (constant 0.12), causing bonded molecule groups to drift and wander together organically instead of slowing down or freezing.
      - **Mutual Attraction**: Particles only attract when they get extremely close (radius reduced from 75px to 45px), meaning they must practically touch to start grouping. Repulsion occurs at an ultra-tight 12px to keep them in highly compressed molecular structures. Bond line connection distance is reduced to 35px.
      - **Mouse Cursor & Touch Repelling (Mobile Support)**: The cursor acts as a repelling force field. Added mobile touchscreen event support (`touchstart`, `touchmove`, `touchend`) with passive listeners. Particles flee/steer away when hovered or touched (within 90px). Tapping/holding/dragging on a mobile screen increases this pushing force by 4.5x, blowing particles away dynamically under the user's finger.
      - **Soil, Water, & Fertilizer Molecule Families**: Particles are categorized into three distinct families on creation (Soil, Water, and Fertilizer). They drift independently and only form bonds, connections, and clusters with matching family members:
        - **SOIL**: Silicon (`Si` - light blue), Organic Matter (`OM` - bronze-orange), Oxygen (`O` - white).
        - **WATER**: Oxygen (`O` - white), Hydrogen (`H` - cyan).
        - **FERTILIZER**: Nitrogen (`N` - green), Phosphorus (`P` - red), Potassium (`K` - yellow).
      - **Density-Triggered Family Explosions**: Once 5 or more particles of the same family pack into an ultra-compact radius (18px), a localized explosion is triggered, emitting a custom-colored shockwave:
        - **Soil**: Ochre/orange-brown shockwave.
        - **Water**: Cyan/light blue shockwave.
        - **Fertilizer**: Green/emerald shockwave.
      - **Anti-Spam Cooldown**: Exploded particles are assigned a cooldown of 120 frames (~2 seconds) during which they cannot re-trigger another explosion, allowing them to disperse gently before gathering again.
      - **Text Avoidance**: Tracks the DOM bounding rectangle of the central hero copy text container. Applied a smooth border-relative push force to steer drifting particles away from the text boundaries, ensuring particles never float directly behind the copy and text legibility remains clean and readable.
2. **Outer Radar Ring & Brighter Glow Blobs (Mockup Only)**:
   - Added a third outer dashed radar line (`.hero-radar-line-outer` at `920px` width) rotating slowly in the center background of the Hero section.
   - Increased background glow blob opacity from `0.16` to `0.22` to give the blue page extra depth and visual fullness.
3. **Reverted Live PHP Templates to Original State**:
   - Reverted all modifications in the production files (`mordin-public/src/components/lib_header.php`, `mordin-public/src/pages/home.php`, and `mordin-public/assets/css/public-home-modern.css`).
   - Standard templates remain untouched, confining all redesign adjustments exclusively to the standalone HTML sample file (`public-home-antigravity-mockup.html`) as requested.
4. **Processed Transparent White Brand Logo**:
   - Resolved the duplicate text issue in the header. Wrote a Python script (`make_logo_transparent.py` using Pillow) that processed the user's uploaded reference image, removed the solid black background to key out a clean transparent white PNG asset (`logo-mitr-phol-white.png`), and auto-cropped margins.
   - Loaded this single asset directly in the HTML as the brand logo, avoiding double text.
   - Dynamically inverts it to a clean slate/black logo (`filter: invert(1) brightness(0.15)`) when the header is scrolled, adapting perfectly to both dark and light navigation backgrounds.

## Previous Work (Audit & Initial Prototypes)
1. **Audited the Public Website**:
   - Inspected `mordin-public/src/routes.php`, `src/pages/home.php`, `src/components/lib_header.php`, and `src/components/lib_footer.php` to understand flight routing, page layouts, and CSS variable loading.
   - Identified UX issues: small font size (16px base), table scroll issues on mobile, low visual density, and lack of clear step-by-step guidance.
2. **Designed a Premium Modern Landing Page**:
   - Elevated typography: Set base font size to `18px` for Thai text (`Sarabun`) and high line-height (`1.8`) to facilitate readability for farmers.
   - Enhanced visuals: Applied smooth blue-green mesh gradients (`#0a1f3d` to `#064332`), responsive glassmorphism navigation, and elegant micro-animations.
   - Provided accessible tap targets: Ensured all main buttons are at least `56px` tall and links have ample touch areas.
   - Built modern card comparison deck: Converted widescreen table into stacked responsive cards.
3. **Created Integrated Interactive SaaS Prototype (`landing-saas-complete.html`)**:
   - Created a comprehensive single-page dashboard mockup in the styling of `antigravity.google` with a dark-neon theme.
   - Fully simulated:
     - **Home tab**: Badge title, SaaS headline, 4 features.
     - **Booking tab**: Form + live selector for slots + detailed receipt screen.
     - **Report lookup**: Database search for phone numbers (`0891234567` or `0819876543`) updating NPK levels, scores, pH classifications, and recommendations.
     - **Map tracker**: Schedule click handlers that pan and open Leaflet popups dynamically.
     - **Authentication session state**: Greets user with header initials widget and pre-fills forms.
4. **Created Style Override File**:
   - Created `mordin-public/assets/css/public-home-modern.css` containing SaaS design tokens and style overrides.
5. **Wrote Implementation Plan**:
   - Created `implementation_plan.md` in the brain artifacts folder detailing the design methodology and requesting user feedback.

## Files Changed / Created
- `mordin-public/landing-saas-complete.html` (New mockup)
- `mordin-public/assets/css/public-home-modern.css` (New stylesheet)
- `C:\Users\songw\.gemini\antigravity\brain\6088c467-6ba7-4bf0-8166-982a75803b63/implementation_plan.md` (Updated implementation plan)
- `CODEX_CONTEXT.md` (Created new)
- `FRONTEND_PROGRESS.md` (Created new)

## Commands Run
- `list_dir` for auditing directories.
- `view_file` for inspecting files.

## Next Recommended Task
- Once the user reviews and approves the design mockup, merge the modern design rules into `src/pages/home.php` and `assets/css/main.css` to integrate dynamic data fetching (upcoming schedule, maps, sessions).

## Live Migration Pass - 2026-06-11

### Completed
- Loaded `mordin-public/assets/css/public-home-modern.css` from `src/components/lib_header.php` with `filemtime` cache busting when the file exists.
- Migrated the live public home page toward `public-home-antigravity-mockup.html` without changing routes or service calls:
  - Added the home particle canvas and lightweight hero particle script.
  - Preserved login-aware booking CTA behavior and `data-require-login`.
  - Preserved `ServiceCalendarAPI::getPublicUpComingCalendar()` and the existing Leaflet `home-map` data flow.
  - Added SaaS/mockup classes to hero, service highlights, map card, about section, and comparison table.
- Scoped the new visual layer to `body.page-home` so other public pages keep their existing layout behavior.

### Verified
- `C:\xampp\php\php.exe -l src\pages\home.php` passed.
- `C:\xampp\php\php.exe -l src\components\lib_header.php` passed.
- Local PHP server on `http://127.0.0.1:8083/` returned 200.
- Rendered HTML contains `public-home-modern.css`, `home-particle-canvas`, `services/book/login`, and `home-map`.
- `http://127.0.0.1:8083/assets/css/public-home-modern.css` returned 200.

### Remaining Plan
1. Do visual QA in a browser: desktop, tablet, and mobile widths; check hero text contrast, logo state, mobile nav, map card height, and canvas density.
2. Move page-specific scripts before the shared footer closing tags or create a page-script slot in `lib_footer.php`; `home.php` already had after-footer page scripts, so this pass preserved the existing pattern.
3. Migrate the same design language to `calendar`, `services/price`, `services/book/*`, `services/report/*`, `shops`, `soil-improvement`, and `contact` one page group at a time.
4. Keep each migration preserving existing PHP forms, session checks, modal hooks, API calls, and no-public-Citizen-ID rule.

## Live Migration Pass - Calendar and Price - 2026-06-11

### Completed
- Migrated `mordin-public/src/pages/calendar.php` one layer closer to `public-home-antigravity-mockup.html`:
  - Added a modern page hero and live metrics calculated from the existing `$upComingData`.
  - Preserved `ServiceCalendarAPI::getPublicUpComingCalendar()`, Leaflet `map-container`, `focusOnMarker()`, booking links, full/available status, and `data-require-login`.
  - Added scoped modern card/map classes without changing route names or service payloads.
- Migrated `mordin-public/src/pages/services/service-price/service-price.php`:
  - Added a modern page hero and live metrics calculated from existing `ServiceTypeAPI`/`LaboratoryAPI` data.
  - Preserved service cards, laboratory inclusion checks, service color tokens, and `calendar` CTA routing.
- Extended `mordin-public/assets/css/public-home-modern.css` with shared `public-modern-*` hero/metric styles plus `body.page-calendar` and `body.page-price` scoped overrides.

### Verified
- `C:\xampp\php\php.exe -l src\pages\calendar.php` passed.
- `C:\xampp\php\php.exe -l src\pages\services\service-price\service-price.php` passed.
- `http://127.0.0.1:8083/calendar` returned 200 and contains `public-calendar-hero`, `public-modern-metrics`, `map-container`, and `data-require-login`.
- `http://127.0.0.1:8083/services/price` returned 200 and contains `public-price-hero`, `public-modern-metrics`, `public-price-card`, and the `calendar` CTA.

### Next Page Group
1. `services/mitr` because it sits beside calendar in the same tab system.
2. `services/book/*` booking flow pages, with extra care around forms, validation, session state, and confirmation modal behavior.
3. `services/report/*` report lookup pages, preserving the no-public-Citizen-ID display rule.

## Live Migration Pass - Service Status - 2026-06-11

### Completed
- Migrated `mordin-public/src/pages/services/service-mitr/service-mitr.php`:
  - Added a modern status hero and live metrics using the existing `ServiceCalendarAPI::getUpComingCalendar()` data.
  - Preserved the calendar/status tab system, PureCounter stats, latest service map, booking CTA, and `data-require-login`.
  - Made the latest-calendar source safer when the API returns an error payload, while keeping the same endpoint and field names.
- Extended `mordin-public/assets/css/public-home-modern.css` with `body.page-service` scoped overrides for status stats, map card, featured status card, and CTA styling.

### Verified
- `C:\xampp\php\php.exe -l src\pages\services\service-mitr\service-mitr.php` passed.
- `http://127.0.0.1:8083/services/mitr` returned 200 and contains `public-status-hero`, `public-modern-metrics`, `public-tab-toggle`, `data-require-login`, and `public-status-card`.
- PHP dev-server log showed `GET /services/mitr [200]` with no fatal errors.

### Next Page Group
1. `services/book/login`, `services/book/register`, and `services/book/farmer` as the first booking-flow slice.
2. Continue with `services/book/land/*`, `create-booking`, `update-booking`, and `cancel-booking`.
3. Then migrate `services/report/*`, preserving the no-public-Citizen-ID display rule.
