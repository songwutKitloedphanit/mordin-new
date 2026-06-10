const testEnv = {
  NODE_ENV: 'test',
  PORT: '3100',
  ALLOW_TEST_DB_RESET: 'true',
  POSTGRES_HOST: '127.0.0.1',
  POSTGRES_PORT: '55432',
  POSTGRES_USER: 'mordin_test',
  POSTGRES_PASSWORD: 'mordin_test',
  POSTGRES_DB: 'mordin_test',
  POSTGRES_SSL: 'false',
  POSTGRES_LOGS_HOST: '127.0.0.1',
  POSTGRES_LOGS_PORT: '55433',
  POSTGRES_LOGS_USER: 'mordin_test',
  POSTGRES_LOGS_PASSWORD: 'mordin_test',
  POSTGRES_LOGS_DB: 'mordin_logs_test',
  POSTGRES_LOGS_SSL: 'false',
  QR_SECRET: '12345678901234567890123456789012',
  JWT_ACCESS_SECRET: 'integration-test-access-secret',
};

function assertSafeTestEnv(env) {
  if (env.NODE_ENV !== 'test') throw new Error('NODE_ENV must be test');
  if (env.ALLOW_TEST_DB_RESET !== 'true') {
    throw new Error('ALLOW_TEST_DB_RESET must be true');
  }
  for (const host of [env.POSTGRES_HOST, env.POSTGRES_LOGS_HOST]) {
    if (!['127.0.0.1', 'localhost'].includes(host)) {
      throw new Error(`Refusing non-local database host: ${host}`);
    }
  }
  for (const database of [env.POSTGRES_DB, env.POSTGRES_LOGS_DB]) {
    if (!database.endsWith('_test')) {
      throw new Error(`Refusing database without _test suffix: ${database}`);
    }
  }
}

module.exports = { assertSafeTestEnv, testEnv };
