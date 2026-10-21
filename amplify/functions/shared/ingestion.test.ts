import test from 'node:test';
import assert from 'node:assert/strict';
import { ingestTelemetry, ingestStatus, type IngestionClient } from './ingestion';
function mock() {
  const writes: unknown[] = [];
  const client: IngestionClient = { models: {
    Devices: { get: async () => ({ data: { owner: 'registered-owner' } }), update: async input => { writes.push(input); return { data: input }; } },
    Telemetry: { create: async input => { writes.push(input); return { data: input }; } },
  } };
  return { client, writes };
}
test('telemetry uses registered ownership and safely passes values', async () => {
  const { client, writes } = mock();
  await ingestTelemetry({ device_id: 'device-1', owner: 'attacker', timestamp: 123, temperature: 20, humidity: 50 }, client);
  assert.deepEqual(writes, [{ device_id: 'device-1', owner: 'registered-owner', timestamp: 123, temperature: 20, humidity: 50 }]);
});
test('malformed and GraphQL injection payloads cannot cause writes', async () => {
  const { client, writes } = mock();
  for (const input of [ { device_id: 'x"}) {deleteDevices}', timestamp: 1 }, { device_id: 'd', timestamp: NaN }, { device_id: 'd', timestamp: 1, temperature: 'mutation' } ]) {
    await assert.rejects(ingestTelemetry(input, client));
  }
  assert.deepEqual(writes, []);
});
test('missing registered devices fail before telemetry write', async () => {
  const { client, writes } = mock(); client.models.Devices.get = async () => ({ data: null });
  await assert.rejects(ingestTelemetry({ device_id: 'd', timestamp: 1 }, client));
  assert.deepEqual(writes, []);
});
test('failed data mutations throw for Lambda retry', async () => {
  const { client } = mock(); client.models.Telemetry.create = async () => ({ errors: ['denied'] });
  await assert.rejects(ingestTelemetry({ device_id: 'd', timestamp: 1 }, client));
});
test('status restricts lifecycle events and preserves device identity', async () => {
  const { client, writes } = mock();
  await ingestStatus({ device_id: 'device-1', eventType: 'connected' }, client);
  await assert.rejects(ingestStatus({ device_id: 'device-1', eventType: 'arbitrary' }, client));
  assert.deepEqual(writes, [{ device_id: 'device-1', status: 'connected' }]);
});
