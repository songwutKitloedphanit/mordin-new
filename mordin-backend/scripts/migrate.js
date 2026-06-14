const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const root = path.resolve(__dirname, '..');
const migrationDir = path.join(root, 'migrations');
const command = process.argv[2];
const requestedId = process.argv[3];

if (!['check', 'status', 'up', 'down'].includes(command)) {
  throw new Error('Usage: node scripts/migrate.js check|status|up|down [migration-id]');
}
if (command === 'down' && !requestedId) {
  throw new Error('Usage: node scripts/migrate.js down <migration-id>');
}

function loadLocalEnv() {
  const filename = path.join(root, '.env');
  if (!fs.existsSync(filename)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(filename, 'utf8')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && line.includes('='))
      .map(line => {
        const index = line.indexOf('=');
        return [
          line.slice(0, index).trim(),
          line.slice(index + 1).trim().replace(/^"|"$/g, ''),
        ];
      })
  );
}

const env = { ...loadLocalEnv(), ...process.env };

function databaseConfig(prefix) {
  return {
    host: env[`${prefix}HOST`],
    port: Number(env[`${prefix}PORT`] || 5432),
    user: env[`${prefix}USER`],
    password: env[`${prefix}PASSWORD`],
    database: env[`${prefix}DB`],
    ssl: env[`${prefix}SSL`] === 'true' ? { rejectUnauthorized: false } : false,
  };
}

const databases = [
  { name: 'main', config: databaseConfig('POSTGRES_') },
  { name: 'logs', config: databaseConfig('POSTGRES_LOGS_') },
];

function discoverMigrations() {
  const files = fs.readdirSync(migrationDir);
  const migrations = new Map();

  for (const filename of files) {
    const match = filename.match(/^(.+)_(main|logs)(\.rollback)?\.sql$/);
    if (!match) continue;
    const [, id, database, rollbackSuffix] = match;
    const migration = migrations.get(id) || { id };
    const direction = rollbackSuffix ? 'down' : 'up';
    migration[database] = migration[database] || {};
    migration[database][direction] = filename;
    migrations.set(id, migration);
  }

  return [...migrations.values()].sort((a, b) => a.id.localeCompare(b.id));
}

const migrations = discoverMigrations();

async function withClient(database, callback) {
  const client = new Client(database.config);
  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

async function ensureHistoryTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      migration_id varchar(150) NOT NULL,
      database_name varchar(20) NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT NOW(),
      PRIMARY KEY (migration_id, database_name)
    )
  `);
}

async function appliedIds(client, databaseName) {
  const exists = await client.query(
    `SELECT to_regclass('public.schema_migrations') AS table_name`
  );
  if (!exists.rows[0].table_name) return new Set();
  const result = await client.query(
    `SELECT migration_id
     FROM schema_migrations
     WHERE database_name = $1
     ORDER BY migration_id`,
    [databaseName]
  );
  return new Set(result.rows.map(row => row.migration_id));
}

async function applyFile(client, filename) {
  await client.query(fs.readFileSync(path.join(migrationDir, filename), 'utf8'));
}

async function migrateUp(database) {
  await withClient(database, async client => {
    await ensureHistoryTable(client);
    const applied = await appliedIds(client, database.name);

    for (const migration of migrations) {
      const target = migration[database.name];
      if (!target?.up || applied.has(migration.id)) continue;

      await client.query('BEGIN');
      try {
        await applyFile(client, target.up);
        await client.query(
          `INSERT INTO schema_migrations (migration_id, database_name)
           VALUES ($1, $2)`,
          [migration.id, database.name]
        );
        await client.query('COMMIT');
        console.log(`[${database.name}] applied ${migration.id}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  });
}

async function migrateDown(database, migration) {
  const target = migration[database.name];
  if (!target?.down) return;

  await withClient(database, async client => {
    const applied = await appliedIds(client, database.name);
    if (!applied.has(migration.id)) {
      console.log(`[${database.name}] not applied ${migration.id}`);
      return;
    }

    await client.query('BEGIN');
    try {
      await applyFile(client, target.down);
      await client.query(
        `DELETE FROM schema_migrations
         WHERE migration_id = $1 AND database_name = $2`,
        [migration.id, database.name]
      );
      await client.query('COMMIT');
      console.log(`[${database.name}] rolled back ${migration.id}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

async function preflightDown(database, migration) {
  const target = migration[database.name];
  if (!target?.down) return;

  await withClient(database, async client => {
    const applied = await appliedIds(client, database.name);
    if (!applied.has(migration.id)) return;

    await client.query('BEGIN');
    try {
      await applyFile(client, target.down);
      await client.query('ROLLBACK');
      console.log(`[${database.name}] rollback preflight OK ${migration.id}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

async function showStatus(database) {
  await withClient(database, async client => {
    const applied = await appliedIds(client, database.name);
    console.log(`[${database.name}] ${database.config.host}/${database.config.database}`);
    for (const migration of migrations) {
      if (!migration[database.name]?.up) continue;
      console.log(`  ${applied.has(migration.id) ? 'applied' : 'pending'} ${migration.id}`);
    }
  });
}

async function main() {
  if (command === 'check') {
    for (const database of databases) {
      await withClient(database, client => client.query('SELECT 1'));
      console.log(`[${database.name}] connection OK`);
    }
    return;
  }

  if (command === 'status') {
    for (const database of databases) await showStatus(database);
    return;
  }

  if (command === 'up') {
    for (const database of databases) await migrateUp(database);
    return;
  }

  const migration = migrations.find(item => item.id === requestedId);
  if (!migration) throw new Error(`Unknown migration: ${requestedId}`);

  for (const database of databases) {
    await preflightDown(database, migration);
  }
  for (const database of [...databases].reverse()) {
    await migrateDown(database, migration);
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
