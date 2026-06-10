const { spawnSync } = require('child_process');
const { assertSafeTestEnv, testEnv } = require('./test-env');

const env = { ...process.env, ...testEnv };
assertSafeTestEnv(env);
console.log(`[main] host=${env.POSTGRES_HOST} database=${env.POSTGRES_DB}`);
console.log(`[logs] host=${env.POSTGRES_LOGS_HOST} database=${env.POSTGRES_LOGS_DB}`);

const result = spawnSync('npm.cmd', ['run', 'test:e2e', '--', '--runInBand'], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit',
  shell: false,
});
process.exitCode = result.status ?? 1;
