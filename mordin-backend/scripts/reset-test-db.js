const { Client } = require('pg');
const { assertSafeTestEnv, testEnv } = require('./test-env');

async function reset(config) {
  const client = new Client(config);
  await client.connect();
  try {
    await client.query('DROP SCHEMA IF EXISTS public CASCADE');
    await client.query('CREATE SCHEMA public');
  } finally {
    await client.end();
  }
}

async function main() {
  const env = { ...process.env, ...testEnv };
  assertSafeTestEnv(env);
  console.log(`[main] host=${env.POSTGRES_HOST} database=${env.POSTGRES_DB}`);
  console.log(`[logs] host=${env.POSTGRES_LOGS_HOST} database=${env.POSTGRES_LOGS_DB}`);
  await reset({
    host: env.POSTGRES_HOST,
    port: Number(env.POSTGRES_PORT),
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
  });
  await reset({
    host: env.POSTGRES_LOGS_HOST,
    port: Number(env.POSTGRES_LOGS_PORT),
    user: env.POSTGRES_LOGS_USER,
    password: env.POSTGRES_LOGS_PASSWORD,
    database: env.POSTGRES_LOGS_DB,
  });
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
