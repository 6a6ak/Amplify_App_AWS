const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

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

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`ESP32 info server running on http://localhost:${port}`));
