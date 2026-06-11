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

## Latest Completed Task (2026-06-11)
- **Fixed KU Mock User Bypass for Render Deployment**:
  1. Updated uth.service.ts and uth.controller.ts to ensure dmin@KU, staff@KU, and exclusive@KU correctly bypass the Azure AD token request, which was failing on the deployed app due to placeholder dummy_scope values.
  2. Ensured correct UserRoles assignment for each KU mock user.
  3. Styled mobile user profile container at the bottom of the nav menu to have a blue border, and styled its inner avatar to be a blue circle with high-contrast white text for the initial letter.

## Files Recently Changed
- `mordin-public/assets/css/main.css` (Updated desktop profile button and added mobile menu contrast & border styles)

## Known Blockers
- None.

## Next Recommended Task / Prompt
- Port the interactive dashboard and executive reports layouts from the HTML mockup into the React codebase (`mordin-private/src/pages/executive/...`).

