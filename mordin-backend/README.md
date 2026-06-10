# Mordin Backend

NestJS API server for the Mordin soil analysis system.

## Scope

This service owns the API used by the private staff app and the public PHP app.
Current modules include authentication, users, farmers, lands, buses, QR codes,
sample receiving, lab results, analysis reports, service areas, service types,
standards, fertilizer settings, dashboards, address data, uploads, and generated
report assets.

## Stack

- Node.js / npm
- NestJS 11
- TypeScript
- TypeORM
- PostgreSQL
- Swagger at `/api`

## Setup

```bash
npm install
copy env.example .env
npm run start:dev
```

The server listens on `0.0.0.0` and uses `PORT` when set, otherwise `3000`.

## Environment

Minimum local variables:

```env
PORT=3000
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=defaultdb
POSTGRES_SSL=false
QR_SECRET=replace-with-at-least-32-characters
JWT_ACCESS_SECRET=replace-with-a-secret
JWT_ACCESS_EXPIRATION=2h
```

The code also supports optional log database variables:

```env
POSTGRES_LOGS_HOST=
POSTGRES_LOGS_PORT=
POSTGRES_LOGS_USER=
POSTGRES_LOGS_PASSWORD=
POSTGRES_LOGS_DB=
POSTGRES_LOGS_SSL=false
```

External auth integration variables are read by `src/auth/auth.service.ts`:

```env
AZURE_AD_URL=
CLIENT_ID=
CLIENT_SECRET=
SCOPE=
API_AUTHEN_PROFILE_URL=
APIM_SUBSCRIPTION_KEY=
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run start:dev` | Start the API in watch mode. |
| `npm run build` | Compile the NestJS app. |
| `npm run start:prod` | Run `dist/main`. |
| `npm run lint` | Run ESLint with auto-fix. |
| `npm run test` | Run Jest unit tests. |
| `npm run test:e2e` | Run e2e tests when the test config exists. |
| `npm run format` | Format files with Prettier. |

## Uploads

Files in `uploads/` are served at `/uploads/`. Do not commit local upload files
unless they are deliberate fixtures.

## Notes For Frontend Work

- Preserve existing routes and response shapes unless an API change is explicitly
  approved.
- Swagger is available at `http://localhost:3000/api` in local development.
- CORS is currently enabled globally in `src/main.ts`.
- QR token encryption requires `QR_SECRET`; validation requires at least 32
  characters.
