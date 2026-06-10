# Mordin Private

Private staff/admin web application for the Mordin soil analysis workflow.

## Scope

This app covers the authenticated back-office flows:

- Admin, officer, and executive route groups.
- Dashboard and report views.
- User, farmer, bus, shop, land, QR code, laboratory, service area, service
  type, standard, analysis setting, fertilizer, and service calendar pages.
- QR code generation and collect-sample workflow.
- Sample receiving, lab result input, analysis report, and generated report
  display.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query / Table
- Tailwind CSS
- Bootstrap 5 and Kaiadmin legacy assets
- Leaflet / Google Maps integrations

## Setup

```bash
npm install
npm run dev
```

For production build:

```bash
npm run build
```

## Environment

The app reads these variables:

```env
VITE_API_URL=http://localhost:3000
VITE_BASE_URL=http://localhost:5173
VITE_GOOGLE_MAPS_API_KEY=
```

`VITE_API_URL` should point to the backend API. `VITE_BASE_URL` is used by QR
and report links where the app needs an absolute frontend URL.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server with host binding. |
| `npm run build` | Run TypeScript build and Vite production build. |
| `npm run preview` | Preview the built app. |
| `npm run lint` | Run ESLint. |
| `npm run lint:fix` | Run ESLint with auto-fix. |
| `npm run format` | Format files with Prettier. |
| `npm run format:check` | Check formatting. |

## Important Paths

| Path | Purpose |
| --- | --- |
| `src/layouts/` | Private layout shell. |
| `src/components/layout/admin/` | Sidebar, header, and footer. |
| `src/routes/` | Role-based route wrappers and route guards. |
| `src/pages/admin/` | Admin management pages. |
| `src/pages/officer/` | Officer workflows such as QR, samples, lab, and reports. |
| `src/pages/executive/` | Executive dashboards. |
| `src/pages/public/CollectSample.tsx` | Public-facing QR collect-sample route inside the Vite app. |
| `src/services/` | API clients and service wrappers. |
| `src/components/ui/` | Shared UI primitives. |

## Working Rules

- Preserve existing routes, roles, forms, tables, filters, reports, and API
  calls.
- Prefer existing components and service wrappers before adding new patterns.
- Keep backend/database changes out of frontend-only work unless explicitly
  approved.
- Update `../FRONTEND_PROGRESS.md` and `../CODEX_CONTEXT.md` after notable
  implementation or audit work.
