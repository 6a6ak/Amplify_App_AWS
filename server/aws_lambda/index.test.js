const test = require('node:test');
const assert = require('node:assert/strict');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const { handler } = require('./index');

test('SDK v3 Lambda preserves pagination and uses a prototype-safe device index', async () => {
  const original = DynamoDBDocument.prototype.send;
  const calls = [];
  DynamoDBDocument.prototype.send = async command => {
    calls.push(structuredClone(command.input));
    return calls.length === 1
      ? { Items: [{ device_id: '__proto__', timestamp: 1 }], LastEvaluatedKey: { device_id: 'next' } }
      : { Items: [{ device_id: '__proto__', timestamp: 2 }, { device_id: 'normal', timestamp: 3, owner: 'private-owner', secret: 'private-key' }] };
  };
  try {
    const response = await handler({});
    assert.equal(response.statusCode, 200);
    assert.deepEqual(calls[1].ExclusiveStartKey, { device_id: 'next' });
    const devices = JSON.parse(response.body).devices;
    assert.equal(devices.length, 2);
    assert.ok(!response.body.includes('private-'));
    assert.equal(devices.find(d => d.device_id === '__proto__').lastSeen, 2);
  } finally { DynamoDBDocument.prototype.send = original; }
});

test('database errors do not leak internal details', async () => {
  const original = DynamoDBDocument.prototype.send;
  DynamoDBDocument.prototype.send = async () => { throw new Error('sensitive internal information'); };
  try {
    const response = await handler({});
    assert.equal(response.statusCode, 500);
    assert.ok(!response.body.includes('sensitive'));
  } finally { DynamoDBDocument.prototype.send = original; }
});
