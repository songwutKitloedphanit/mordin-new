# AGENTS.md

## Project Goal

This workspace contains the Mordin soil analysis system:

- `mordin-backend/` - NestJS API server.
- `mordin-private/` - private staff/admin React app.
- `mordin-public/` - public PHP website.

Current goal: stabilize the whole system so all existing workflows work
correctly, then modernize the Public and Private UX/UI without breaking existing
features, routes, API behavior, authentication behavior, or user flows.

This is no longer only a frontend visual pass. Bug fixing is allowed across the
active apps when needed, but changes must stay conservative and must preserve
existing contracts unless an API/database change is explicitly approved.

Do not edit `MorDinGinDin/`, `Source_Code/`, or `drive/` unless explicitly
requested. Those folders are archive/reference copies.

---

## Main Requirements

1. Audit and fix bugs across `mordin-backend`, `mordin-private`, and
   `mordin-public`.
2. Make the core system workflows usable end to end:
   - login/logout and role-based access
   - dashboard access
   - user/farmer/land/shop/bus/lab/service management
   - QR code generation and collect-sample flow
   - booking and public member flows
   - sample receiving
   - lab result entry
   - analysis report and generated report display
   - public report lookup
3. Fix broken API calls, incorrect data mapping, invalid route parameters,
   missing loading/error states, form validation gaps, and runtime crashes.
4. Improve UX/UI for Public and Private pages with a consistent, modern,
   professional style suitable for an agricultural/laboratory/official service
   system.
5. Preserve all existing features, routes, forms, tables, filters, reports,
   create/edit/delete flows, authentication behavior, and role behavior.
6. Use existing backend APIs and existing frontend service wrappers whenever
   possible.
7. Keep API contract changes minimal. If a bug cannot be fixed without changing
   backend/database behavior, document the blocker and propose the smallest
   change first.
8. Improve responsive behavior for desktop, tablet, and mobile.
9. Add clear loading, empty, success, and error states where workflows currently
   feel broken or ambiguous.
10. Remove sensitive console logging and avoid exposing tokens or sensitive user
    data in UI or logs.
11. Keep documentation current after each implementation round by updating
   `FRONTEND_PROGRESS.md` and `CODEX_CONTEXT.md`.

---

## New Requirements Pending Design / Implementation (2026-06-02)

These requirements were requested for the next implementation round. Preserve
existing workflows until the detailed behavior is confirmed.

### 1. Do Not Display Citizen ID Numbers In Public

- Do not render citizen ID card numbers on public pages.
- Do not expose citizen ID card numbers in public URLs, QR payloads, HTML,
  client-side logs, or user-facing errors.
- If a public confirmation screen must identify a person, use a safe masked
  value or another non-sensitive label.
- Current assumption: this requirement prohibits displaying citizen ID numbers.
  Do not remove an existing required input field or change an API contract until
  the affected public workflow has been reviewed and the intended behavior is
  confirmed.

### 2. Add Factory And Promotion-Zone Management

- Add a new menu entry under the Private sidebar `MANAGEMENT` group for managing
  factories and promotion zones.
- Treat factories and promotion zones as maintainable reference data because
  the values can change each year.
- Preserve historical meaning: yearly changes should not silently overwrite
  data already referenced by older records or reports.
- Before implementation, inspect existing backend entities and APIs. If the
  workflow needs a new endpoint, database column, table, or migration, document
  the smallest required backend/database change and request explicit approval.

Current first-phase implementation status:

- Reuse the existing Private `/admin/service-area` list/add/edit workflow and
  backend CRUD. The MANAGEMENT sidebar now labels this workflow
  `FACTORIES & ZONES`.
- Factory create/update continue to run in a PostgreSQL transaction and store
  promotion-zone codes with trim plus uppercase normalization.
- Promotion-zone codes are allowed to repeat across different factories. Do
  not infer a move from a matching code.
- Private factory edit rows now expose an explicit move action. The backend
  moves the selected `service_area_id` to the chosen factory and keeps the same
  identifier.
- A zone cannot be moved after it has references in `farmers`, `books`, or
  `qr_codes`. Add a new zone instead so historical records keep their meaning.
- The move flow does not add a database table, column, or migration.
- Full annual version history is not implemented. Existing `factory` and
  `service_area` entities have no year, effective-date, active, or archive
  fields. Add those capabilities only after database and API design approval.

### 3. Avoid Repeated Data Entry When Scanning QR Codes

Current problem:

- A first scan allows a user to enter information and link it when a matching
  record exists.
- When the same person scans again later, the flow asks for the information
  again, creating repeated work.

Requested idea:

- Consider a separate QR code for returning users who already completed the
  first QR flow, so they do not need to enter the same information again.

Recommended design direction:

- Keep the existing QR code printed on each sample bag. Do not add a separate
  shared QR code.
- Add a `ใช้ข้อมูลเดิม` action to the existing collect-sample form. Returning
  users search by phone number, select masked farmer/land choices, and reuse data
  through an opaque, short-lived, one-time `selectionToken`.
- For a returning user, show a confirmation step with safe identifying details,
  reuse the existing linked data, and allow editing only when something changed.
- Do not create duplicate farmer, land, or sample-related records merely because
  a returning user scans again.
- Preserve the existing manual pin/edit fallback behavior.
- Use Redis for one-time tokens, lookup rate limits, and trial-phase pending
  owner-review state without adding PostgreSQL schema changes in the first
  implementation phase.
- Require Staff to verify ownership before receiving samples submitted through
  `ใช้ข้อมูลเดิม`.

Detailed approved design:

- `QR_RETURNING_USER_FLOW_DESIGN.md`

Deferred questions before implementation:

1. Confirm Redis environment-variable names and deployment ownership.
2. Confirm the Redis production persistence mode.
3. Decide whether to add a permanent PostgreSQL audit-event table after the
   Redis-backed trial.
4. Decide whether yearly factory and promotion-zone history needs a dedicated
   versioning model beyond per-sample snapshots.

---

## Completed / Historical Requirements

The previous standalone requirements for Private sidebar grouping, Private
topbar controls, QR coordinate linking, report Excel matching, analysis/report
linkage, and basic security hardening were consolidated into project context and
logs during the documentation cleanup.

Do not treat those older items as the active task list. If a bug is found in one
of those areas, fix it as part of the current stabilization goal and document the
specific issue.

Reference files that still contain useful historical detail:

- `CODEX_CONTEXT.md`
- `FRONTEND_PROGRESS.md`
- `FRONTEND_AUDIT.md`
- `DESIGN_REFERENCE.md`
- `MANUAL_TEST_CASES.md`
- `PRIVATE_TEST_LOG_2026-05-19.md`
- `DOCUMENTATION_AUDIT.md`

---

## Important Constraints

The existing system must be preserved.

Do not:

- Remove existing routes.
- Remove existing pages.
- Remove existing features.
- Remove existing forms.
- Remove existing tables.
- Remove existing filters.
- Remove existing reports.
- Remove existing create/edit/delete flows.
- Remove existing API calls.
- Break public PHP routes or private React routes.
- Change API contracts unless explicitly approved.
- Modify database schema unless explicitly approved.
- Create database migrations unless explicitly approved.
- Rename backend fields unless explicitly approved.
- Invent new backend endpoints when an existing endpoint can be used.
- Rewrite authentication.
- Rename roles.
- Change token structure.
- Hard-code fake data if real API data already exists.
- Replace real API behavior with mock behavior.
- Paste the HTML reference files directly as static application pages.

If backend, API, or database support is missing:

- Do not fake the behavior on the frontend.
- Document the blocker clearly.
- Propose the smallest possible backend/database change for review.
- Do not implement database/schema changes without explicit confirmation.

### Database Change Policy

- Do NOT modify, alter, restructure, or "improve" the database (schema, tables,
  columns, indexes, constraints, seed/reference data, or migrations) unless it
  is genuinely necessary to complete the requested task. Prefer using the
  existing schema as-is.
- If a database change IS genuinely necessary, STOP and grill the user first
  (run the `grill-me` skill): interrogate the need, alternatives, blast radius,
  rollback, and data-migration impact until there is shared understanding and
  explicit approval. Only after that approval may you make the change.
- "Convenience" refactors of the DB (renames, normalization, dropping unused
  columns, reformatting data) are never justification on their own — they go
  through the same grill-first approval.

---

## Bug Fixing Rules

When fixing bugs:

1. Reproduce or identify the failure mode before editing when practical.
2. Prefer the smallest fix that restores the intended workflow.
3. Trace data flow across frontend, backend, and public PHP when the symptom
   involves API data.
4. Validate route params, query params, form values, IDs, QR tokens, and
   coordinates before using them.
5. Keep user-facing errors clear and safe; avoid raw backend stack traces or
   sensitive details.
6. Preserve existing data shape and UI affordances unless they are the source of
   the bug.
7. Do not hide a backend/data bug with placeholder frontend data.
8. After a fix, run the narrowest relevant checks first, then broader build/lint
   checks if the blast radius is larger.

Priority order:

1. Runtime crashes and broken login/access.
2. Data loss or incorrect create/edit/delete behavior.
3. Incorrect report, QR, sample, lab, or booking behavior.
4. Broken API integration or bad data mapping.
5. Mobile/responsive blockers.
6. Visual defects that hurt usability.

---

## Testing Rules

These rules apply to ALL testing work (backend Jest/e2e, private Playwright,
manual verification, and any test data).

- No smoke tests. A test that only checks "it renders / endpoint returns 200 /
  page loads without crashing" is NOT acceptable as the test for a feature.
  Write real tests that exercise the actual behavior, assert real outcomes
  (correct values, correct state changes, correct DB/API effects, correct
  error handling), and would actually fail if the feature were broken.
- Test against real behavior. Drive the real code path / real endpoint / real
  flow end to end wherever practical, instead of asserting on stubs.
- No surface-level / "stuck-on-the-front" mocks. Do not paste fake values into
  the UI or a response just to make something appear to work. Do not replace
  real API behavior with a hard-coded mock to dodge writing a real test.
  (Reinforces "Do not fake the behavior on the frontend" above.)
- Produce real test data instead. When data is needed for a test, create
  genuine, representative test data (seed it, build it through the real
  create/flow, or generate a proper fixture that matches the real data shape) so
  the test runs against data the system would actually produce — not a
  decorative placeholder.
- If a real test is genuinely impossible (missing backend/API/DB support),
  document the blocker per the Important Constraints rules rather than
  substituting a smoke test or a faked mock.

---

## UX/UI Modernization Rules

The UI should feel suitable for:

- Agricultural service operations.
- Soil analysis workflows.
- Laboratory data entry and review.
- Official organization use.
- Private/admin dashboards.
- Public service website users.

Design direction:

- Use Sarabun as the primary font where the app supports it.
- Private React UI: use Bootstrap 5 (Kaiadmin) as the primary styling system.
  This is the de-facto standard in this app (~1,500 Bootstrap utility usages vs
  ~390 Tailwind). For NEW code, prefer Bootstrap utility classes for layout and
  spacing (`d-flex`, `gap-2`, `w-100`, `justify-content-between`, `me-2`, `p-3`,
  `text-center`) instead of the Tailwind equivalents (`flex`, `w-full`,
  `justify-between`, ...). Do not introduce new Tailwind utility classes in
  files that are not already Tailwind-based.
- Tailwind CSS is retained only for the executive dashboard pages
  (`pages/executive/Dashboard.tsx`, `Dashboard2.tsx`) and the Tailwind-native
  shared components in `components/ui/` that they consume. Keep these as-is; do
  not rewrite them to Bootstrap unless explicitly requested. Treat Tailwind as
  legacy/scoped, not the default for new work.
- Brand colors are available as CSS variables (`--mp-dark`, `--mp-light`,
  `--mp-border`, `--mp-text-dark`, `--mp-text-gray`, `--mp-fert-green`) in
  `src/index.css`, in addition to the Tailwind `mp.*` palette. Prefer the CSS
  variables in new Bootstrap-based code so it does not depend on Tailwind.
- Keep public PHP styling in `mordin-public/assets/css/main.css`; do not add npm
  tooling or Tailwind to the public PHP app unless explicitly requested.
- Use modern, quiet, work-focused dashboard patterns for Private pages.
- Use clear public-service website patterns for Public pages.
- Keep layouts responsive and readable on mobile.
- Prefer reusable components for repeated UI patterns.
- Keep cards, tables, filters, forms, buttons, and navigation consistent.
- Improve density and scanability on operational pages.
- Add clear empty/error/loading states.

Avoid:

- Decorative redesign that hides workflows.
- Marketing-only landing sections where the user needs actual functionality.
- New UI libraries unless the project already depends on them or approval is
  given.
- Large visual rewrites mixed with unrelated backend logic.
- Removing existing class names that are used by JavaScript, tests, or vendor
  assets.

---

## Active App Guidance

### Backend: `mordin-backend/`

- NestJS, TypeScript, TypeORM, PostgreSQL.
- Swagger is available at `/api` when running locally.
- Keep controllers/services/entities contract-compatible unless a change is
  explicitly approved.
- Fix backend bugs when the existing API is demonstrably incorrect or crashes.
- Do not change schema/migrations without explicit confirmation.
- Do not commit local uploads unless they are deliberate test fixtures.

Useful commands:

```bash
npm run start:dev
npm run build
npm run lint
npm run test
```

### Private App: `mordin-private/`

- React 19, TypeScript, Vite, Tailwind CSS, Bootstrap/Kaiadmin legacy assets.
- Preserve role-based route guards and auth flow.
- Prefer existing service wrappers in `src/services/`.
- Keep existing routes available.
- Use shared components where possible.
- Improve dashboard/admin workflows without breaking create/edit/delete flows.

Useful commands:

```bash
npm run dev
npm run build
npm run lint
npm run format:check
```

### Public App: `mordin-public/`

- PHP multi-page app with bundled Flight-style routing.
- No npm build step.
- Keep public routes, form methods, input names, session behavior, redirects,
  and backend API calls stable.
- Keep BootstrapMade/vendor JavaScript hooks intact:
  `navmenu`, `mobile-nav-toggle`, `toggle-dropdown`, `mobile-nav-active`,
  `dropdown-active`, `scroll-top`, `preloader`.
- Use `.env` / `API_BASE_URL` rather than hard-coded backend URLs.

Useful checks:

```bash
php -l src/routes.php
php -l path/to/changed-file.php
```

---

## Existing System Preservation

All existing system functionality must remain available.

Preserve:

- Existing routes.
- Existing pages.
- Existing role-based access.
- Existing login flow.
- Existing logout flow.
- Existing API calls.
- Existing forms.
- Existing tables.
- Existing reports.
- Existing filters.
- Existing create/edit/delete flows.
- Existing dashboard flows.
- Existing report generation flows.
- Existing QR and manual pin/edit fallback behavior.
- Existing booking and public member flows.

If something appears unused, document it before removing anything.

Do not remove features unless explicitly instructed.

---

## Security And Data Safety

Apply practical hardening while fixing bugs.

Allowed:

1. Protect private frontend routes.
2. Prevent private UI from flashing before auth loading completes.
3. Hide role-restricted menu items from unauthorized roles.
4. Avoid exposing tokens or sensitive data in console logs.
5. Avoid exposing sensitive user data in UI.
6. Validate URL parameters before using them.
7. Validate QR token and QR lat/lng values before using them.
8. Validate report/result IDs from route or query params.
9. Avoid unsafe HTML rendering.
10. Improve user-facing error messages.
11. Ensure logout clears frontend auth state.
12. Add safe fallback UI when permission/data is missing.
13. Document backend security blockers.

Not allowed without explicit confirmation:

1. Database schema changes.
2. API contract changes.
3. Authentication rewrite.
4. Role model rewrite.
5. Token format changes.
6. New backend endpoints.
7. Large security refactor.
8. Removing existing features.

---

## Work Log And Context Rule

After every task or implementation round, update:

- `FRONTEND_PROGRESS.md`
- `CODEX_CONTEXT.md`

### `FRONTEND_PROGRESS.md`

Use this file as the detailed work log.

Add newest updates at the top and include:

1. What was done.
2. Which files were changed.
3. Why the change was made.
4. What was not changed.
5. Commands run.
6. Test/build/lint result.
7. Remaining issues.
8. Blockers.
9. Next recommended task.

### `CODEX_CONTEXT.md`

Use this file as the short high-signal summary for future sessions.

Keep it concise and include:

1. Current project status.
2. Important constraints.
3. Latest completed task.
4. Files recently changed.
5. Known blockers.
6. Next recommended prompt/task.

---

## Git And Change Control Rules

Work in small, reviewable changes.

Recommended branch naming:

```text
fix/system-stabilization
fix/public-workflows
fix/private-workflows
fix/backend-api
ui/public-refresh
ui/private-refresh
docs/context-update
```

Commit message examples:

```text
fix(auth): prevent private route flash before auth resolves
fix(report): use selected analysis result in generated report
fix(public): validate collect-sample QR token before API call
fix(api): return stable sample receiving payload
ui(private): refresh management table empty states
ui(public): improve booking form responsive layout
docs(context): update current stabilization requirements
```

Rules:

1. Keep bug fixes grouped by workflow or subsystem.
2. Do not mix visual redesign with unrelated backend logic.
3. Do not mix broad security hardening with cosmetic UI changes.
4. After each phase, update logs before committing.
5. Do not continue building on top of a broken state.
6. Do not revert user changes unless explicitly requested.

---

## Commands

Before finishing a task, run available commands relevant to the changed app.

Use only commands that exist in the project.

Common examples:

```bash
npm run build
npm run lint
npm run test
php -l path/to/file.php
```

If a command does not exist or cannot run in the current environment, document
that in `FRONTEND_PROGRESS.md`.

Do not invent scripts.

---

## Definition Of Done

A task is not complete until all required items are done:

1. The bug or UX/UI request is handled within the requested scope.
2. Existing features are preserved.
3. API contracts are unchanged unless explicitly approved.
4. Database schema is unchanged unless explicitly approved.
5. Relevant checks are run, or skipped checks are documented with a reason.
6. `FRONTEND_PROGRESS.md` is updated.
7. `CODEX_CONTEXT.md` is updated.
8. Any blockers are documented.
9. Next recommended task is written clearly.
