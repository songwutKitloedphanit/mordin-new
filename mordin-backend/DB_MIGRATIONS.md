# Database Migrations

This file is the operational record for PostgreSQL schema changes used by
`mordin-backend`.

## Deployment Procedure

The backend uses separate `main` and `logs` PostgreSQL databases. Run migrations
before starting the new backend build:

```bash
npm run migrate:check
npm run migrate:status
npm run migrate:up
npm run migrate:status
```

`migrate:up` applies pending SQL files in filename order and records each
successful database migration in `schema_migrations`, scoped by the logical
connection name (`main` or `logs`). This also supports deployments where both
connections point to the same physical database. Every migration runs in a
transaction.

Before production migration:

1. Back up both the main and logs databases.
2. Stop or drain backend writers.
3. Run the commands above using the deployment environment variables.
4. Start the backend and run its smoke tests.

Rollback is explicit and must name one migration:

```bash
npm run migrate:down -- 20260604_book_collected_address
```

Rollback SQL refuses to remove columns or tables that already contain data.
Restore from backup when a destructive rollback is required.
Before changing either database, the runner executes every applicable rollback
inside a transaction and rolls it back. This preflight prevents a known guard
or SQL failure from causing a partial cross-database rollback.

## Migration File Convention

Each logical migration can target either or both databases:

```text
migrations/<id>_main.sql
migrations/<id>_main.rollback.sql
migrations/<id>_logs.sql
migrations/<id>_logs.rollback.sql
```

Forward migrations must be idempotent. Rollback migrations must fail closed
when removing an object would lose data.

The migration runner creates `schema_migrations` in each physical database. Its
primary key is `(migration_id, database_name)` so main and logs migrations are
tracked independently.

## Change Log

### 20260605_service_area_versioning

Purpose: preserve historical factory/promotion-zone meaning when promotion
zones change by month or year.

Main database:

- Adds active/effective-date versioning columns to `service_areas`.
- Replaces the full `(code, factory_id)` unique constraint with an active-only
  partial unique index.
- Adds a self-reference from old zones to their replacement zone.
- Extends the service-area advisory lock trigger to include `is_active`
  changes and fixes update trigger returns.

Logs database:

- Adds the same versioning columns to `service_areas_logs`.

Rollback safety:

- Refuses rollback after any service-area versioning history exists.

### 20260604_laboratory_grading_default

Purpose: keep new laboratory records consistent with the `Laboratory` entity
when `isUseForGrading` is omitted.

Main database:

- Changes the default of `laboratories.is_use_for_grading` from `true` to
  `false`.
- Does not modify existing laboratory rows.

### 20260604_book_collected_address

Purpose: preserve the submitted land-address snapshot on each sample round.

Main database:

- Adds nullable `books.subdistrict_code`.
- Adds nullable `books.zip_code`.
- Adds `idx_books_subdistrict_code`.
- Adds a foreign key from `books.subdistrict_code` to `subdistricts.code`.

Logs database:

- Adds nullable `books_logs.subdistrict_code`.
- Adds nullable `books_logs.zip_code`.

Application dependency:

- `Book` and `BookLog` entities include both snapshot fields.

### 20260602_service_area_outbox

Purpose: make factory and service-area changes auditable across the separate
main and logs databases.

Main database:

- Adds `audit_outbox` and its pending-event index.
- Adds service-area reference indexes.
- Adds advisory-lock functions and triggers for service-area moves.

Logs database:

- Removes invalid uniqueness constraints from factory and service-area history.
- Adds `audit_event_id` and `action` to `factories_logs` and
  `service_areas_logs`.
- Adds unique partial indexes for `audit_event_id`.

Rollback safety:

- Refuses to drop `audit_outbox` after it contains events.

## 2026-06-04 Live Database Cleanup

Before these migrations were formalized, the live main database had ad hoc
`books.subdistrict_code` and `books.zip_code` columns. They were backed up and
removed on June 4, 2026 so deployment can recreate them through the tracked
migration.

Backup location used during cleanup:

```text
C:\mordin\db-backups\20260604_083335
```

## Deployment Records

### 2026-06-04 Aiven Development Databases

Applied at approximately `2026-06-04 09:10 Asia/Bangkok`:

- `20260602_service_area_outbox` on main and logs.
- `20260604_book_collected_address` on main and logs.
- Restored four backed-up `books` address snapshot rows after migration.

Applied at approximately `2026-06-04 09:50 Asia/Bangkok`:

- `20260604_laboratory_grading_default` on main.
- Confirmed the migration changed only the column default and left all seven
  existing laboratory rows unchanged.

Verification:

- `npm run migrate:up` rerun completed without applying duplicate migrations.
- `npm run migrate:status` reports every applicable migration as applied.
- `npm run migrate:check` reports both connections healthy.
- `npm run build` completed successfully.
- A read-only TypeORM schema comparison found no missing tables, columns, or
  entity defaults after the migrations.
- The async logs connection now includes `name: 'logs'` in its TypeORM options,
  allowing Nest to close both database connections during deploys and restarts.
- A Nest application-context smoke test initialized and closed successfully
  against the live main and logs databases.

Post-migration backup:

```text
C:\mordin\db-backups\20260604_0910_post_migration
C:\mordin\db-backups\20260604_095337_schema_restored
```
