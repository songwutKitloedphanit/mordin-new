# Mordin Workspace

This workspace contains the active Mordin applications and the working project
documentation used during the frontend and integration cleanup.

## Active Applications

| Path | Purpose | Stack |
| --- | --- | --- |
| `mordin-private/` | Private staff/admin web app for dashboard, management, QR, sample, lab, and report workflows. | React, TypeScript, Vite, Tailwind CSS, Bootstrap/Kaiadmin |
| `mordin-backend/` | API server for auth, users, farmers, land, QR, samples, lab data, service settings, fertilizer, reports, uploads, and dashboard data. | NestJS, TypeScript, TypeORM, PostgreSQL |
| `mordin-public/` | Public service website for service info, booking, QR/report pages, shops, calendar, and contact pages. | PHP, Flight-style routing, HTML/CSS/JS |

## Reference / Archive Folders

| Path | Status |
| --- | --- |
| `MorDinGinDin/` | Archive/export copy. Do not treat as the active development target unless explicitly requested. |
| `Source_Code/` | Submission/source-code copy. Do not treat as the active development target unless explicitly requested. |
| `drive/` | External/reference files. |

## Documentation Map

| File | Keep? | Notes |
| --- | --- | --- |
| `AGENTS.md` | Yes | Main working instructions and constraints for Codex sessions. |
| `CODEX_CONTEXT.md` | Yes | Short current-state summary for future sessions. |
| `FRONTEND_PROGRESS.md` | Yes | Detailed chronological work log. |
| `FRONTEND_AUDIT.md` | Yes | Historical audit findings and implementation notes. |
| `DESIGN_REFERENCE.md` | Yes | Detailed UI/design reference extracted from the HTML mockups. |
| `MANUAL_TEST_CASES.md` | Yes | Manual regression checklist. |
| `PRIVATE_TEST_LOG_2026-05-19.md` | Yes | Evidence from the latest private UI workflow test pass. |
| `DOCUMENTATION_AUDIT.md` | Yes | Current documentation audit and cleanup record. |

Older standalone requirement and prompt files were removed because their useful
content is already consolidated in `AGENTS.md`, `CODEX_CONTEXT.md`, and the
active logs above.

## Quick Start

Run each app from its own folder.

```bash
cd mordin-backend
npm install
npm run start:dev
```

```bash
cd mordin-private
npm install
npm run dev
```

For the public PHP app, serve `mordin-public/` with a PHP-capable web server.
Set `API_BASE_URL` in `mordin-public/.env` when the backend URL changes.

## Default Local URLs

| Service | URL |
| --- | --- |
| Backend API | `http://localhost:3000` |
| Swagger | `http://localhost:3000/api` |
| Private app | `http://localhost:5173` or the Vite-assigned port |
| Public app | Depends on the configured PHP server |

## Working Rules

- Use `mordin-private/`, `mordin-backend/`, and `mordin-public/` as the active
  source folders.
- Do not edit backend/database contracts for frontend-only tasks unless the
  change is explicitly approved.
- Preserve existing routes, role flows, API calls, reports, forms, filters,
  and create/edit/delete workflows.
- Update `FRONTEND_PROGRESS.md` and `CODEX_CONTEXT.md` after implementation or
  audit tasks.
