const test = require('node:test');
const assert = require('node:assert/strict');
const { createApiGuard } = require('./security');
async function check(method, path, token, verifier, env = {}) {
  let status, allowed = false;
  const res = { status(code) { status = code; return this; }, json() { return this; } };
  await createApiGuard({ env, verifier })({ method, path, headers: { authorization: token } }, res, () => { allowed = true; });
  return { status, allowed };
}
test('public telemetry reads stay available', async () => assert.equal((await check('GET', '/devices')).allowed, true));
test('anonymous mutation and diagnostics are rejected', async () => {
  for (const [method, path] of [['POST', '/devices/a/force-offline'], ['POST', '/admin/users'], ['GET', '/internal/status-map'], ['GET', '/INTERNAL/status-map'], ['GET', '/esp32/info']]) {
    assert.equal((await check(method, path)).status, 401);
  }
});
test('missing configuration fails closed', async () => assert.equal((await check('POST', '/admin/users', 'Bearer token')).status, 503));
test('forged or expired tokens are rejected', async () => assert.equal((await check('POST', '/admin/users', 'Bearer forged', { verify: async () => { throw Error(); } })).status, 401));
test('ordinary signed-in users cannot administer devices', async () => assert.equal((await check('POST', '/admin/users', 'Bearer token', { verify: async () => ({ 'cognito:groups': ['users'] }) })).status, 403));
test('verified administrators are allowed', async () => assert.equal((await check('POST', '/admin/users', 'Bearer token', { verify: async () => ({ 'cognito:groups': ['admin'] }) })).allowed, true));
