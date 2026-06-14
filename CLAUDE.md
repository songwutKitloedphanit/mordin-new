# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Active Applications

| Path | Stack | Purpose |
|---|---|---|
| `mordin-backend/` | NestJS, TypeScript, TypeORM, PostgreSQL | REST API for all data |
| `mordin-private/` | React 19, TypeScript, Vite, Tailwind CSS | Staff/admin dashboard |
| `mordin-public/` | PHP, Flight routing | Public service website |

**Do not edit `MorDinGinDin/`, `Source_Code/`, or `drive/` — those are archives.**

## Development Commands

### Backend (`mordin-backend/`)
```bash
npm run start:dev    # watch mode
npm run build        # compile
npm run start:prod   # run compiled output
npm run lint         # ESLint --fix
npm run test         # Jest unit tests
npm run test:e2e     # end-to-end tests
npm run format       # Prettier
```

### Private Frontend (`mordin-private/`)
```bash
npm run dev          # Vite dev server (--host)
npm run build        # tsc + vite build
npm run lint         # ESLint
npm run lint:fix     # ESLint --fix
npm run format       # Prettier
```

### Public PHP (`mordin-public/`)
Serve `mordin-public/` with a PHP-capable web server. No build step.

## Local URLs

| Service | URL |
|---|---|
| Backend API | `http://localhost:3000` |
| Swagger docs | `http://localhost:3000/api` |
| Private app | `http://localhost:5173` (or Vite-assigned port) |

## Environment Variables

**`mordin-backend/.env`** (see `env.example`):
- `POSTGRES_HOST/PORT/USER/PASSWORD/DB` — main PostgreSQL
- `POSTGRES_LOGS_*` — separate PostgreSQL connection for audit logs
- `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRATION` — JWT config
- `AZURE_AD_URL`, `CLIENT_ID`, `CLIENT_SECRET`, `SCOPE` — Azure AD auth
- `API_AUTHEN_PROFILE_URL`, `APIM_SUBSCRIPTION_KEY` — Mitrphol API auth
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` — mock login for local dev (no Azure required)
- `QR_SECRET` — QR code encryption key

**`mordin-private/.env.local`**:
- `VITE_API_URL` — backend base URL
- `VITE_GOOGLE_MAPS_API_KEY` — Google Maps API key

**`mordin-public/.env`**:
- `API_BASE_URL` — backend base URL

## Architecture

### Backend (`mordin-backend/src/`)

Standard NestJS module layout: each domain has `*.controller.ts`, `*.service.ts`, `*.module.ts`, `dto/`, `entities/`.

**Two TypeORM database connections:**
- `default` — main application data (all `*.entity.ts` excluding `*.log.entity.ts`)
- `logs` — audit log data (`*.log.entity.ts`); `synchronize: true` in dev

**Authentication flow:**
1. Client POSTs credentials to `/auth/login`
2. Backend calls Azure AD for a client-credentials token (cached in memory)
3. Uses that token to call Mitrphol API (`API_AUTHEN_PROFILE_URL`) with user credentials
4. On success, issues a short-lived JWT (`access_token`)
5. **For local dev without Azure AD**, `mockLogin` checks against `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars

**Domain modules:** `address`, `auth`, `buses`, `dashboard`, `farmers`, `fertilizer`, `laboratory`, `lands`, `reference-data`, `result-grade`, `sample`, `service-area`, `service-calendars`, `service-type`, `shops`, `soil-grade`, `standard-sample`, `users`

`common/` contains shared interceptors, filters, middleware, dto, entities, enums, transformers, utils, and a calculation engine under `common/calculation/`.

### Private Frontend (`mordin-private/src/`)

**Role-based routing** in `App.tsx`: three route groups each wrapped in `RouteGuard`:
- `/admin/*` — `UserRole.Admin` only (`AdminRoute.tsx`)
- `/officer/*` — Admin + Staff (`OfficerRoute.tsx`)
- `/executive/*` — Admin + Staff + Executive (`ExecutiveRoute.tsx`)

**Auth state** lives in `AuthContext.tsx`:
- JWT stored in `localStorage` under the key from `constants/localstorageKey.ts`
- On load, fetches user profile to validate the stored token; redirects to `/login` on failure
- `useAuth()` hook provides `user`, `login`, `logout`, `isLoggedIn`, `isLoading`, `error`

**Axios instance** (`services/Axios.ts`):
- Attaches `Bearer` token from localStorage to every request
- Shows NProgress bar during requests
- On 401, clears localStorage and redirects to `/login`

**Layout** (`layouts/AdminLayout.tsx`):
- Dark mode toggle stored in localStorage as `mordin-private-theme`
- Sidebar groups: HOME, MANAGEMENT, OPERATIONS, SYSTEM SETTINGS (see `AGENTS.md` for full menu spec)
- Breadcrumb generation is path-based using `breadcrumbNames` map in `AdminLayout.tsx`

**Key libraries:** TanStack Query (server state), React Router v7, Axios, Chart.js / ECharts, Leaflet (maps), Handsontable (spreadsheet), `@react-pdf/renderer` (PDF), QR libraries, SweetAlert2

**Public-facing page:** `/collect-sample/:code` renders without auth, used by QR code scan.

### Public Frontend (`mordin-public/src/`)

Uses the **Flight** PHP micro-framework (bundled in `src/flight/`) for routing.

- `index.php` bootstraps Flight and loads `src/routes.php`
- Routes map URLs to page templates in `src/pages/`
- Shared components (header, footer) in `src/components/`
- API clients in `src/services/` (PHP classes with static methods calling the NestJS backend)
- `src/config/config.php` reads `.env` for `API_BASE_URL`

Key routes: `/`, `/calendar`, `/contact`, `/shops`, `/soil-improvement`, `/booking`, `/collect-sample/@code` (QR scan), `/services/book/*` (farmer booking flow), `/services/report/*` (soil report viewer).

## Project Constraints (from AGENTS.md)

This is a **frontend-first improvement** project. Backend/database changes require explicit confirmation.

- Never remove existing routes, pages, forms, tables, API calls, or features
- Never change API contracts, rename backend fields, or create DB migrations
- If a requirement needs backend work, document the blocker instead of implementing it
- Use `FRONTEND_PROGRESS.md` and `CODEX_CONTEXT.md` as the working log — update them after each task

## Key Documentation Files

| File | Purpose |
|---|---|
| `AGENTS.md` | Full constraint list, UI spec, nav groups, topbar spec, QR rules, report rules |
| `CODEX_CONTEXT.md` | Current session state and next recommended task |
| `FRONTEND_PROGRESS.md` | Detailed work log — update after every task |
| `FRONTEND_AUDIT.md` | Historical audit findings |
| `DESIGN_REFERENCE.md` | Visual design spec extracted from HTML mockups |
| `MANUAL_TEST_CASES.md` | Manual regression checklist |
| `private_example.html` | Visual reference for private app UI |
| `public_example.html` | Visual reference for public site UI |
