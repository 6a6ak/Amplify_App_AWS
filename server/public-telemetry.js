// Public telemetry is deliberately limited to the fields used by the demo UI.
// Never forward arbitrary database records, external API responses or shadows.
const publicFields = new Set([
  'devices', 'items', 'device_id', 'lastSeen', 'lastItem', 'online', 'name',
  'timestamp', 'temperature', 'humidity', 'speed', 'plate', 'from', 'status',
  'source', 'shadow', 'state', 'reported', 'data', 'error', 'detail',
]);
function publicTelemetry(value) {
  if (Array.isArray(value)) return value.map(publicTelemetry);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => publicFields.has(key))
      .map(([key, item]) => [key, publicTelemetry(item)]));
  }
  return value;
}
function limitPublicTelemetry(req, res, next) {
  const json = res.json.bind(res);
  res.json = value => json(req.auth ? value : publicTelemetry(value));
  next();
}
module.exports = { publicTelemetry, limitPublicTelemetry };
