const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
// parse JSON bodies for admin endpoints
app.use(express.json());

// Simple request logging for debugging frontend requests
app.use((req, res, next) => {
  try {
    console.log(`[req] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  } catch (e) {}
  next();
});

// AWS SDK for DynamoDB access
const AWS = require('aws-sdk');
const region = process.env.AWS_REGION || 'eu-central-1';
AWS.config.update({ region });
const ddb = new AWS.DynamoDB.DocumentClient();
const DDB_TABLE = process.env.DDB_TABLE || 'ESP_Data';
// status tracking: map device_id -> { lastSeen: timestamp, online: bool }
const lastStatusByDevice = new Map();
const ONLINE_THRESHOLD_MS = Number(process.env.ONLINE_THRESHOLD_MS || 60000); // 60s default

// SSE clients
const sseClients = new Set();

function sendSse(event, data) {
  const payload = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try { res.write(payload); } catch (e) { /* ignore broken pipes */ }
  }
}

// polling removed: relying on MQTT status messages for real-time updates

// --- AWS IoT MQTT subscribe for real-time status ---
const IOT_ENDPOINT = process.env.AWS_IOT_ENDPOINT || 'a2v6h6fq7j6lhc-ats.iot.eu-central-1.amazonaws.com';
const TOPIC_FILTER = process.env.STATUS_TOPIC_FILTER || '+/status';

let mqttConnected = false;

// IoT Data client for Device Shadow access (used for authoritative online/offline)
const iotData = new AWS.IotData({ endpoint: IOT_ENDPOINT });

async function getShadow(thingName) {
  try {
    const resp = await iotData.getThingShadow({ thingName }).promise();
    if (resp && resp.payload) {
      const payload = JSON.parse(resp.payload.toString());
      return payload;
    }
    return null;
  } catch (e) {
    // ResourceNotFoundException or 404 means shadow doesn't exist
    if (e.code === 'ResourceNotFoundException' || e.statusCode === 404) return null;
    throw e;
  }
}

// Prefer v2 SDK if available, otherwise fall back to v1 (aws-iot-device-sdk)
try {
  const iot = require('aws-iot-device-sdk-v2');
  const mqtt = iot.mqtt;
  const iotSdkClient = new iot.AwsIotMqttConnectionConfigBuilder()
    .with_clean_session(false)
    .with_client_id('esp32-status-ws-' + Math.floor(Math.random() * 10000))
    .with_endpoint(IOT_ENDPOINT)
    .with_region(region)
    .build();

  const client = new mqtt.MqttClient();
  const connection = client.new_connection(iotSdkClient);

  (async () => {
    try {
      await connection.connect();
      mqttConnected = true;
      console.log('Connected to AWS IoT (v2) for status subscribe');
      await connection.subscribe(TOPIC_FILTER, mqtt.QoS.AtMostOnce, (topic, payload) => {
        try {
          const msg = payload.toString();
          const parts = topic.split('/');
          const deviceId = parts.length > 1 ? parts[0] : parts[0];
          const now = Date.now();
          let online = true;
          try {
            const p = JSON.parse(msg);
            if (typeof p.message === 'object' && typeof p.message.status === 'string') {
              online = (p.message.status.toLowerCase() === 'online');
            } else if (typeof p.online === 'boolean') online = p.online;
            else if (typeof p.status === 'string') online = (p.status.toLowerCase() === 'online');
          } catch (e) {
            online = !!msg && msg.trim().length > 0;
          }
          lastStatusByDevice.set(deviceId, { lastSeen: now, online });
          sendSse('status', { device_id: deviceId, lastSeen: now, online, source: 'mqtt' });
        } catch (e) {
          console.error('Error handling mqtt message', e && e.message);
        }
      });
    } catch (e) {
      console.error('AWS IoT (v2) subscribe failure', e && e.message);
    }
  })();
} catch (e) {
  console.warn('aws-iot-device-sdk-v2 not available, trying v1 fallback:', e && e.message);
  try {
    const awsIot = require('aws-iot-device-sdk');
    const client = awsIot.device({
      region,
      host: IOT_ENDPOINT,
      protocol: 'wss',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
      clientId: 'esp32-status-ws-' + Math.floor(Math.random() * 10000)
    });

    client.on('connect', () => {
      mqttConnected = true;
      console.log('Connected to AWS IoT (v1) for status subscribe');
      client.subscribe(TOPIC_FILTER, {}, (err) => {
        if (err) console.error('Subscribe error', err);
      });
    });

    client.on('message', (topic, payload) => {
      try {
        const msg = (payload || '').toString();
        const parts = topic.split('/');
        const deviceId = parts.length > 1 ? parts[0] : parts[0];
        const now = Date.now();
        let online = true;
        try {
          const p = JSON.parse(msg);
          if (typeof p.message === 'object' && typeof p.message.status === 'string') {
            online = (p.message.status.toLowerCase() === 'online');
          } else if (typeof p.online === 'boolean') online = p.online;
          else if (typeof p.status === 'string') online = (p.status.toLowerCase() === 'online');
        } catch (e) {
          online = !!msg && msg.trim().length > 0;
        }
        lastStatusByDevice.set(deviceId, { lastSeen: now, online });
        sendSse('status', { device_id: deviceId, lastSeen: now, online, source: 'mqtt' });
      } catch (e) {
        console.error('Error handling mqtt message (v1)', e && e.message);
      }
    });

    client.on('error', (err) => console.error('iot client error', err && err.message));
  } catch (e2) {
    console.warn('No AWS IoT MQTT SDK available, skipping MQTT subscribe:', e2 && e2.message);
  }
}

// --- Light polling fallback: periodically scan DynamoDB to refresh lastStatusByDevice ---
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 30000);
async function pollDynamoForStatus() {
  try {
    const params = { TableName: DDB_TABLE };
    const items = [];
    let data;
    do {
      data = await ddb.scan(params).promise();
      if (data.Items) items.push(...data.Items);
      params.ExclusiveStartKey = data.LastEvaluatedKey;
    } while (data.LastEvaluatedKey);

    const latest = new Map();
    for (const it of items) {
      const id = it.device_id;
      if (!latest.has(id) || (it.timestamp && latest.get(id).timestamp < it.timestamp)) {
        latest.set(id, it);
      }
    }

    const now = Date.now();
    for (const [device_id, lastItem] of latest.entries()) {
      const existing = lastStatusByDevice.get(device_id) || { lastSeen: 0, online: false };
      const computedOnline = ((now - (lastItem.timestamp || 0)) <= ONLINE_THRESHOLD_MS);
      const newLastSeen = Math.max(existing.lastSeen || 0, lastItem.timestamp || 0);
      lastStatusByDevice.set(device_id, { lastSeen: newLastSeen, online: existing.online || computedOnline });
    }
  } catch (e) {
    console.error('Polling DynamoDB for status failed', e && e.message);
  }
}

// start polling regardless; it will complement MQTT-driven updates
setInterval(() => { if (!mqttConnected) console.log('Polling DynamoDB for status (mqtt not connected)'); pollDynamoForStatus(); }, POLL_INTERVAL_MS);

const SKETCH_PATH = path.join(__dirname, '..', 'aws_iotcore_esp32', 'aws_iotcore_esp32.ino');

function parseSketch(src) {
  const result = {};
  const publishMatch = src.match(/#define\s+AWS_IOT_PUBLISH_TOPIC\s+"([^"]+)"/);
  const subscribeMatch = src.match(/#define\s+AWS_IOT_SUBSCRIBE_TOPIC\s+"([^"]+)"/);
  const sendIntervalMatch = src.match(/long\s+sendInterval\s*=\s*(\d+);/);
  if (publishMatch) result.publishTopic = publishMatch[1];
  if (subscribeMatch) result.subscribeTopic = subscribeMatch[1];
  if (sendIntervalMatch) result.sendIntervalMs = Number(sendIntervalMatch[1]);
  // find AWS endpoint constant reference (if present in secrets it's not here)
  const usesThingName = /THINGNAME\s*=\s*""/.test(src) || /WiFi\.macAddress\(\)/.test(src);
  result.usesThingNameFromMac = !!usesThingName;
  return result;
}

app.get('/api/esp32/info', (req, res) => {
  fs.readFile(SKETCH_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Cannot read sketch file', detail: err.message });
    const parsed = parseSketch(data);
    return res.json({ parsed, raw: data.split('\n').slice(0,300).join('\n') });
  });
});

// (device listing moved below with online status augmentation)

// Return recent telemetry for a single device (by device_id)
app.get('/api/devices/:id', async (req, res) => {
  const deviceId = req.params.id;
  try {
    const params = {
      TableName: DDB_TABLE,
      KeyConditionExpression: 'device_id = :d',
      ExpressionAttributeValues: { ':d': deviceId },
      ScanIndexForward: false, // descending by sort key (timestamp)
      Limit: 50
    };
    const data = await ddb.query(params).promise();
    return res.json({ device_id: deviceId, items: data.Items || [] });
  } catch (err) {
    return res.status(500).json({ error: 'DynamoDB query failed', detail: err.message });
  }
});

// SSE endpoint for real-time status updates
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  // send a comment to keep connection alive
  res.write(': connected\n\n');
  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
});

// augment /api/devices to include online inferred from lastStatusByDevice if available
// we already implemented /api/devices above; replace behavior by intercepting
// easier: add a wrapper endpoint that proxies to the same logic but adds online field
app.get('/api/devices', async (req, res) => {
  try {
    // reuse previous logic: scan table and compute latest per device
    const params = { TableName: DDB_TABLE };
    const items = [];
    let data;
    do {
      data = await ddb.scan(params).promise();
      if (data.Items) items.push(...data.Items);
      params.ExclusiveStartKey = data.LastEvaluatedKey;
    } while (data.LastEvaluatedKey);

    const map = new Map();
    for (const it of items) {
      const id = it.device_id;
      if (!map.has(id) || (it.timestamp && map.get(id).timestamp < it.timestamp)) {
        map.set(id, it);
      }
    }

    const now = Date.now();
    const devices = Array.from(map.entries()).map(([device_id, lastItem]) => {
      const s = lastStatusByDevice.get(device_id);
      const online = s ? s.online : ((now - (lastItem.timestamp || 0)) <= ONLINE_THRESHOLD_MS);
      return ({ device_id, lastSeen: lastItem.timestamp, lastItem, online });
    });
    return res.json({ devices });
  } catch (err) {
    return res.status(500).json({ error: 'DynamoDB scan failed', detail: err.message });
  }
});

// Return Thing Shadow or fallback to retained MQTT / DynamoDB-derived status
app.get('/api/devices/:id/shadow', async (req, res) => {
  const deviceId = req.params.id;
  try {
    const shadow = await getShadow(deviceId);
    const now = Date.now();
    if (shadow) {
      // try to derive online from reported.lastSeen if present
      let online = null;
      try {
        const rep = shadow.state && shadow.state.reported;
        if (rep && typeof rep.lastSeen === 'number') {
          online = ((now - rep.lastSeen) <= ONLINE_THRESHOLD_MS);
        }
      } catch (e) { /* ignore */ }

      // If shadow exists but doesn't include lastSeen, fall back to MQTT in-memory status
      if (online === null) {
        const s = lastStatusByDevice.get(deviceId);
        if (s && typeof s.online === 'boolean') {
          online = s.online;
        } else {
          // final attempt: look up latest telemetry in DynamoDB to infer online
          try {
            const params = {
              TableName: DDB_TABLE,
              KeyConditionExpression: 'device_id = :d',
              ExpressionAttributeValues: { ':d': deviceId },
              ScanIndexForward: false,
              Limit: 1
            };
            const data = await ddb.query(params).promise();
            const item = (data.Items && data.Items[0]) || null;
            const lastSeen = item ? (item.timestamp || null) : null;
            online = lastSeen ? ((now - lastSeen) <= ONLINE_THRESHOLD_MS) : false;
          } catch (ddbErr) {
            // if DDB lookup fails, leave online null
          }
        }
      }

      return res.json({ device_id: deviceId, shadow, online, source: 'shadow' });
    }

    // fallback to MQTT in-memory lastStatusByDevice
    const s = lastStatusByDevice.get(deviceId);
    if (s) return res.json({ device_id: deviceId, lastSeen: s.lastSeen, online: s.online, source: 'mqtt' });

    // final fallback: query DynamoDB for latest timestamp for this device
    try {
      const params = {
        TableName: DDB_TABLE,
        KeyConditionExpression: 'device_id = :d',
        ExpressionAttributeValues: { ':d': deviceId },
        ScanIndexForward: false,
        Limit: 1
      };
      const data = await ddb.query(params).promise();
      const item = (data.Items && data.Items[0]) || null;
      const lastSeen = item ? (item.timestamp || null) : null;
      const online = lastSeen ? ((now - lastSeen) <= ONLINE_THRESHOLD_MS) : false;
      return res.json({ device_id: deviceId, lastSeen, online, source: 'ddb' });
    } catch (ddbErr) {
      return res.status(500).json({ error: 'DynamoDB query failed', detail: ddbErr.message });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Shadow lookup failed', detail: err.message });
  }
});

// Admin: force a device to offline immediately (in-memory) and emit SSE
app.post('/api/devices/:id/force-offline', (req, res) => {
  const deviceId = req.params.id;
  const ts = Date.now() - (ONLINE_THRESHOLD_MS + 1000);
  // mark as offline in the in-memory map
  lastStatusByDevice.set(deviceId, { lastSeen: ts, online: false });
  // notify SSE clients so UI updates immediately
  sendSse('status', { device_id: deviceId, lastSeen: ts, online: false, source: 'admin' });
  return res.json({ device_id: deviceId, lastSeen: ts, online: false, updated: 'in-memory' });
});

// Admin: force device offline by updating Thing Shadow (persistent until device updates it)
app.post('/api/devices/:id/force-offline-shadow', async (req, res) => {
  const deviceId = req.params.id;
  const now = Date.now();
  const reported = { online: false, lastSeen: now };
  const payload = { state: { reported } };
  try {
    await iotData.updateThingShadow({ thingName: deviceId, payload: Buffer.from(JSON.stringify(payload)) }).promise();
    // also update in-memory map so UI updates immediately
    const offlineTs = now - (ONLINE_THRESHOLD_MS + 1000);
    lastStatusByDevice.set(deviceId, { lastSeen: offlineTs, online: false });
    sendSse('status', { device_id: deviceId, lastSeen: offlineTs, online: false, source: 'shadow-admin' });
    return res.json({ device_id: deviceId, updated: 'shadow', reported, result: 'ok' });
  } catch (e) {
    console.error('updateThingShadow failed', e && e.message);
    return res.status(500).json({ error: 'updateThingShadow failed', detail: e && e.message });
  }
});

const port = process.env.PORT || 3333;
// If a built frontend exists, serve it as static files so a single server serves both API and UI
const staticPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  // fallback to index.html for SPA routes
  app.get('/*', (req, res) => {
    // if the request is for the API, skip the SPA fallback
    if (req.path.startsWith('/api/')) return res.status(404).end();
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

if (!process.env.LAMBDA_TASK_ROOT) {
  app.listen(port, () => console.log(`ESP32 info server running on http://localhost:${port}`));
}

// Admin: force a device to offline immediately (in-memory) and emit SSE
app.post('/api/devices/:id/force-offline', (req, res) => {
  const deviceId = req.params.id;
  const ts = Date.now() - (ONLINE_THRESHOLD_MS + 1000);
  // mark as offline in the in-memory map
  lastStatusByDevice.set(deviceId, { lastSeen: ts, online: false });
  // notify SSE clients so UI updates immediately
  sendSse('status', { device_id: deviceId, lastSeen: ts, online: false, source: 'admin' });
  return res.json({ device_id: deviceId, lastSeen: ts, online: false, updated: 'in-memory' });
});

// Admin: force device offline by updating Thing Shadow (persistent until device updates it)
app.post('/api/devices/:id/force-offline-shadow', async (req, res) => {
  const deviceId = req.params.id;
  const now = Date.now();
  const reported = { online: false, lastSeen: now };
  const payload = { state: { reported } };
  try {
    await iotData.updateThingShadow({ thingName: deviceId, payload: Buffer.from(JSON.stringify(payload)) }).promise();
    // also update in-memory map so UI updates immediately
    const offlineTs = now - (ONLINE_THRESHOLD_MS + 1000);
    lastStatusByDevice.set(deviceId, { lastSeen: offlineTs, online: false });
    sendSse('status', { device_id: deviceId, lastSeen: offlineTs, online: false, source: 'shadow-admin' });
    return res.json({ device_id: deviceId, updated: 'shadow', reported, result: 'ok' });
  } catch (e) {
    console.error('updateThingShadow failed', e && e.message);
    return res.status(500).json({ error: 'updateThingShadow failed', detail: e && e.message });
  }
});

// DEBUG endpoint: show in-memory lastStatusByDevice map (for troubleshooting)
app.get('/api/internal/status-map', (req, res) => {
  try {
    const arr = Array.from(lastStatusByDevice.entries()).map(([k,v]) => ({ device_id: k, ...v }));
    return res.json({ count: arr.length, items: arr });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = app;

// DEBUG endpoint: show in-memory lastStatusByDevice map (for troubleshooting)
app.get('/api/internal/status-map', (req, res) => {
  try {
    const arr = Array.from(lastStatusByDevice.entries()).map(([k,v]) => ({ device_id: k, ...v }));
    return res.json({ count: arr.length, items: arr });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
