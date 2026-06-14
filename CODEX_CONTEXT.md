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
- **Switched MapPicker to LeafletMapPicker & Moved Layout**:
  - Replaced the Google `MapPicker` with `LeafletMapPicker` in `CollectionWizardModal.tsx` to fix the API key `AuthFailure` issue.
  - Moved the interactive map from the right-hand column (`col-lg-7` under the Land Form) to the left-hand column (`col-lg-5` below the Check Existing Land list).

## Files Recently Changed
- `mordin-private/src/pages/officer/sample-receiving/CollectionWizardModal.tsx` (Modified)

## Known Blockers
- None.

## Next Recommended Task / Prompt
- Port the interactive dashboard and executive reports layouts from the HTML mockup into the React codebase (`mordin-private/src/pages/executive/...`).

