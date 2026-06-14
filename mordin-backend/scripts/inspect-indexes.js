// READ-ONLY DB inspector. Reports table sizes, existing indexes, and foreign
// keys that lack a backing index. Does NOT modify schema or data.
// Usage: node scripts/inspect-indexes.js
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const root = path.resolve(__dirname, '..');

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

const config = {
  host: env.POSTGRES_HOST,
  port: Number(env.POSTGRES_PORT || 5432),
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  ssl: env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  statement_timeout: 15000,
};

// Tables that grow with usage (the ones that matter for scale).
const BIG_TABLES = [
  'farmers', 'lands', 'books', 'results', 'qr_codes',
  'fertilizer_major_land_scores', 'fertilizer_major_land_usages',
  'fertilizer_minor_land_usages',
];

async function main() {
  const client = new Client(config);
  await client.connect();
  try {
    // 1. Row counts + on-disk size for the big tables.
    const sizes = await client.query(`
      SELECT c.relname AS table,
             c.reltuples::bigint AS est_rows,
             pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
        AND c.relname = ANY($1)
      ORDER BY pg_total_relation_size(c.oid) DESC;
    `, [BIG_TABLES]);

    console.log('\n=== TABLE SIZES (estimated rows) ===');
    for (const r of sizes.rows) {
      console.log(`  ${r.table.padEnd(34)} ~${String(r.est_rows).padStart(10)} rows   ${r.total_size}`);
    }

    // 2. Foreign keys whose referencing column has NO index (Postgres does not
    //    auto-index FKs). These are the columns that make JOINs / cascade slow.
    const unindexedFks = await client.query(`
      SELECT con.conrelid::regclass::text AS table,
             att.attname AS fk_column,
             con.confrelid::regclass::text AS references
      FROM pg_constraint con
      JOIN pg_attribute att
        ON att.attrelid = con.conrelid AND att.attnum = con.conkey[1]
      WHERE con.contype = 'f'
        AND con.connamespace = 'public'::regnamespace
        AND array_length(con.conkey, 1) = 1
        AND NOT EXISTS (
          SELECT 1 FROM pg_index i
          WHERE i.indrelid = con.conrelid
            AND con.conkey[1] = ANY(i.indkey[0:0])
        )
      ORDER BY 1, 2;
    `);

    console.log('\n=== FOREIGN KEYS WITHOUT A BACKING INDEX ===');
    if (unindexedFks.rows.length === 0) {
      console.log('  (none — every single-column FK is indexed)');
    } else {
      let bigCount = 0;
      for (const r of unindexedFks.rows) {
        const onBig = BIG_TABLES.includes(r.table.replace(/^public\./, ''));
        if (onBig) bigCount++;
        console.log(`  ${onBig ? '[BIG] ' : '      '}${r.table}.${r.fk_column}  ->  ${r.references}`);
      }
      console.log(`\n  Total unindexed FKs: ${unindexedFks.rows.length} (${bigCount} on big/growing tables)`);
    }

    // 3. All existing indexes on the big tables, for reference.
    const idx = await client.query(`
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = ANY($1)
      ORDER BY tablename, indexname;
    `, [BIG_TABLES]);

    console.log('\n=== EXISTING INDEXES ON BIG TABLES ===');
    let current = '';
    for (const r of idx.rows) {
      if (r.tablename !== current) { current = r.tablename; console.log(`  ${current}:`); }
      const cols = r.indexdef.replace(/.*\(/, '(').replace(/^\((.*)\)$/, '$1');
      console.log(`     - ${r.indexname}  ${cols}`);
    }
  } finally {
    await client.end();
  }
}

main().catch(err => { console.error('INSPECT FAILED:', err.message); process.exit(1); });
