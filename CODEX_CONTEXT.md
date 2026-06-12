# Codex Context - Mordin Public UI Modernization

## Current Project Status
- The public website (`mordin-public`) is a PHP application running Flight routing.
- The private admin (`mordin-private`) is a React 19 + Vite + TypeScript app.
- A fully integrated, interactive single-page mockup `landing-saas-complete.html` has been designed and created.
- A modern CSS override stylesheet `public-home-modern.css` has been created.
- A unified premium interactive Dashboard & Reports mockup `dashboard-reports-premium.html` has been created.
- A high-fidelity redesigned Dashboard & Reports mockup `dashboard-reports-redesign.html` matching Noto Sans Thai UI guidelines has been created.

## Important Constraints
- Preserve existing routes, controllers, and PHP page logic.
- Avoid introducing Tailwind CSS or npm tooling into the PHP app.
- Ensure the primary font is Sarabun.
- Do not display Citizen ID numbers in the public domain.
- Do not change API contracts or database schema without explicit approval.

## Latest Completed Task (2026-06-12)
- **Soil Sample Stepper Wizard**:
  1. Developed [CollectionWizardModal.tsx](file:///c:/mordin/mordin-private/src/pages/officer/sample-receiving/CollectionWizardModal.tsx) to manage adding missing farmers and lands in-place during the sample receiving flow.
  2. Implemented a visual stepper indicator showing the stages: `ตรวจสอบ QR` → `เกษตรกร` → `แปลงปลูก` → `พร้อมรับตัวอย่าง`.
  3. Pre-populated farmer and land forms with details retrieved from the scanned QR code, supporting Factory, Service Area, Province, District, Subdistrict, and Zip Code dropdowns, along with `วันเดือนปีเกิด` (Birth Date) for the farmer.
  4. Added a Leaflet Map preview in the reference panel on the left with a fallback message for missing/invalid coordinates.
  5. Modified [SampleReceivingInfo.tsx](file:///c:/mordin/mordin-private/src/pages/officer/sample-receiving/SampleReceivingInfo.tsx) to integrate the modal. The "Add Farmer" button starts the wizard at Step 2 (Farmer), and the "Add Land" button starts at Step 3 (Land) or Step 2 (if farmer is missing).
  6. Added cancel and close buttons on all stages that exit the modal without saving the current state, and added a success step (Step 4) indicating completion.
  7. Configured the success callback to reload the sample details automatically, enabling immediate confirmation to receive the sample.

## Files Recently Changed
- `mordin-private/src/pages/officer/sample-receiving/CollectionWizardModal.tsx` (New stepper wizard modal component)
- `mordin-private/src/pages/officer/sample-receiving/SampleReceivingInfo.tsx` (Modified to integrate the stepper wizard modal)

## Known Blockers
- None.

## Next Recommended Task / Prompt
- Port the interactive dashboard and executive reports layouts from the HTML mockup into the React codebase (`mordin-private/src/pages/executive/...`).

