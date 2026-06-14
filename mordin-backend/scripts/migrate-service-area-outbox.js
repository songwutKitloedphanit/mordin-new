const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const mode = process.argv[2];
if (!['--check', '--apply', '--rollback'].includes(mode)) {
  throw new Error('Usage: node scripts/migrate-service-area-outbox.js --check|--apply|--rollback');
}

const root = path.resolve(__dirname, '..');
const migrationDir = path.join(root, 'migrations');
const main = {
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
};
const logs = {
  host: process.env.POSTGRES_LOGS_HOST,
  port: Number(process.env.POSTGRES_LOGS_PORT || 5432),
  user: process.env.POSTGRES_LOGS_USER,
  password: process.env.POSTGRES_LOGS_PASSWORD,
  database: process.env.POSTGRES_LOGS_DB,
  ssl: process.env.POSTGRES_LOGS_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

function describe(name, config) {
  console.log(`[${name}] host=${config.host} database=${config.database}`);
}

async function runSql(config, filename) {
  const client = new Client(config);
  await client.connect();
  try {
    await client.query(fs.readFileSync(path.join(migrationDir, filename), 'utf8'));
  } finally {
    await client.end();
  }
}

async function assertRollbackAllowed() {
  const client = new Client(main);
  await client.connect();
  try {
    const table = await client.query(`SELECT to_regclass('public.audit_outbox') AS table_name`);
    if (!table.rows[0].table_name) return;
    const result = await client.query('SELECT COUNT(*)::int AS count FROM audit_outbox');
    if (result.rows[0].count > 0) {
      throw new Error('Rollback refused: audit_outbox already contains events');
    }
  } finally {
    await client.end();
  }
}

async function check() {
  const mainClient = new Client(main);
  const logsClient = new Client(logs);
  await mainClient.connect();
  await logsClient.connect();
  try {
    await mainClient.query('SELECT 1');
    await logsClient.query('SELECT 1');
    console.log('Connections OK. Run --apply after backup.');
  } finally {
    await mainClient.end();
    await logsClient.end();
  }
}

async function mainRun() {
  describe('main', main);
  describe('logs', logs);
  if (mode === '--check') return check();
  if (mode === '--rollback') {
    await assertRollbackAllowed();
    await runSql(logs, '20260602_service_area_outbox_logs.rollback.sql');
    await runSql(main, '20260602_service_area_outbox_main.rollback.sql');
    console.log('Rollback completed');
    return;
  }
  await runSql(main, '20260602_service_area_outbox_main.sql');
  await runSql(logs, '20260602_service_area_outbox_logs.sql');
  console.log('Migration completed');
}

mainRun().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
