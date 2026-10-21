type Result = { data?: unknown; errors?: readonly unknown[] };
export interface IngestionClient {
  models: {
    Devices: {
      get: (input: { device_id: string }) => Promise<{ data?: { owner?: string | null } | null; errors?: readonly unknown[] }>;
      update: (input: { device_id: string; status: string }) => Promise<Result>;
    };
    Telemetry: { create: (input: { device_id: string; owner: string; timestamp: number; temperature?: number; humidity?: number }) => Promise<Result> };
  };
}
type Event = Record<string, unknown>;
function deviceId(event: Event): string {
  if (typeof event.device_id !== 'string' || !/^[a-zA-Z0-9:_-]{1,128}$/.test(event.device_id)) {
    throw new Error('Invalid device identifier');
  }
  return event.device_id;
}
function requireSuccess(result: Result) {
  if (result.errors?.length || !result.data) throw new Error('Ingestion failed');
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
}
export async function ingestTelemetry(event: Event, client: IngestionClient) {
  const id = deviceId(event);
  if (typeof event.timestamp !== 'number' || !Number.isSafeInteger(event.timestamp) || event.timestamp < 0) {
    throw new Error('Invalid telemetry timestamp');
  }
  for (const field of ['temperature', 'humidity']) {
    if (event[field] !== undefined && (typeof event[field] !== 'number' || !Number.isFinite(event[field]))) {
      throw new Error('Invalid telemetry measurement');
    }
  }
  const device = await client.models.Devices.get({ device_id: id });
  if (device.errors?.length || !device.data?.owner) throw new Error('Device has no registered owner');
  // Ownership comes from the registered device, never the untrusted event.
  return requireSuccess(await client.models.Telemetry.create({
    device_id: id,
    owner: device.data.owner,
    timestamp: event.timestamp,
    temperature: event.temperature as number | undefined,
    humidity: event.humidity as number | undefined,
  }));
}
export async function ingestStatus(event: Event, client: IngestionClient) {
  const id = deviceId(event);
  if (event.eventType !== 'connected' && event.eventType !== 'disconnected') throw new Error('Invalid status');
  return requireSuccess(await client.models.Devices.update({ device_id: id, status: event.eventType }));
}
