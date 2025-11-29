import React, { useEffect, useState } from 'react';

export default function Esp32Info() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch('http://localhost:3333/api/esp32/info')
      .then((r) => {
        if (!r.ok) throw new Error('Network response not ok');
        return r.json();
      })
      .then((j) => {
        if (mounted) setInfo(j.parsed || null);
      })
      .catch((e) => mounted && setError(e.message));
    return () => (mounted = false);
  }, []);

  if (error)
    return (
      <div style={{ marginTop: 16 }}>
        <strong>ESP32 info:</strong> Error: {error}
      </div>
    );

  if (!info)
    return (
      <div style={{ marginTop: 16 }}>
        <strong>ESP32 info:</strong> Loading...
      </div>
    );

  return (
    <div style={{ marginTop: 16, padding: 12, border: '1px solid #ddd' }}>
      <h2 style={{ margin: '0 0 8px 0' }}>ESP32 sketch info</h2>
      <div><strong>Publish topic:</strong> <code>{info.publishTopic || '-'}</code></div>
      <div><strong>Subscribe topic:</strong> <code>{info.subscribeTopic || '-'}</code></div>
      <div><strong>Send interval:</strong> <code>{info.sendIntervalMs ?? '-'}</code> ms</div>
      <div><strong>Thing name from MAC:</strong> {info.usesThingNameFromMac ? 'yes' : 'no'}</div>
    </div>
  );
}
