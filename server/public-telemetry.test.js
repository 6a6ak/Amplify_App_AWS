const test = require('node:test');
const assert = require('node:assert/strict');
const { publicTelemetry } = require('./public-telemetry');
test('public data excludes ownership, credentials and unknown nested fields', () => {
  const result = publicTelemetry({ devices: [{ device_id: 'demo', owner: 'private-user', email: 'private', lastItem: { temperature: 21, token: 'secret', privateField: 'secret' }, shadow: { state: { reported: { online: true, password: 'secret' } } } }] });
  assert.deepEqual(result, { devices: [{ device_id: 'demo', lastItem: { temperature: 21 }, shadow: { state: { reported: { online: true } } } }] });
});
