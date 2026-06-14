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

## Latest Completed Task (2026-06-15)
- **Fixed Render Deployment and Summary Diagnostics**:
  - Rewrote migration `20260615_add_fertilizer_land_scores_main.sql` using conditional PL/pgSQL blocks (`DO $$ ... $$`) to prevent database relation conflict errors.
  - Wrapped database query in `getSummaryCards()` in backend with `try-catch` to throw descriptive error messages.
  - Updated private React dashboard card (`DashBoardCard.tsx`) to show the server-side database error in UI alert when query fails (prioritizing `data.message` over `data.error` to render actual database driver details).

## Files Recently Changed
- `mordin-backend/migrations/20260615_add_fertilizer_land_scores_main.sql` (Modified)
- `mordin-backend/src/sample/fertilizer-major-land-scores/fertilizer-major-land-scores.service.ts` (Modified)
- `mordin-private/src/components/pages/executive/dashboard/DashBoardCard.tsx` (Modified)

## Known Blockers
- None.

## Next Recommended Task / Prompt
- If needed, extend backend `/qr-codes` search to include `qrCode.thaiNationalId`, `book.farmer.thaiNationalId`, and linked land fields so searching matches the display fallback.
