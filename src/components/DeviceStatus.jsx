import React, { useEffect, useState, useRef } from 'react';

export default function DeviceStatus({ apiBase = '' }) {
  const [devices, setDevices] = useState([]);
  const [sseConnected, setSseConnected] = useState(false);
  // When running in Vite dev mode the frontend origin is different (5173).
  // Default to the API server on localhost:3333 in development so fetch/SSE go to the API.
  const devBase = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development' ? 'http://localhost:3333' : '';
  const base = apiBase || devBase || '';
  const evtSourceRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetch(base + '/api/devices')
      .then((r) => r.ok ? r.json() : Promise.reject('fetch-failed'))
      .then((j) => mounted && setDevices(j.devices || []))
      .catch(() => mounted && setDevices([]));

    // connect SSE
    const es = new EventSource(base + '/api/events');
    evtSourceRef.current = es;
    es.addEventListener('status', (e) => {
      try {
        const d = JSON.parse(e.data);
        setDevices((prev) => {
          const map = new Map(prev.map(x => [x.device_id, x]));
          const cur = map.get(d.device_id) || { device_id: d.device_id, lastSeen: d.lastSeen, lastItem: null };
          cur.lastSeen = d.lastSeen;
          cur.online = d.online;
          // preserve source (mqtt or poll)
          cur.source = d.source || cur.source || 'mqtt';
          map.set(d.device_id, cur);
          return Array.from(map.values());
        });
      } catch (err) { /* ignore parse errors */ }
    });

    es.onopen = () => setSseConnected(true);
    es.onerror = (ev) => {
      // server may close or SSE may reconnect; reflect disconnected state
      setSseConnected(false);
    };

    return () => {
      mounted = false;
      try { es.close(); } catch (e) {}
    };
  }, [apiBase]);

  const ONLINE_THRESHOLD_MS = 60000; // align with server default

  if (!devices || devices.length === 0) return (
    <div style={{ padding: 12, border: '1px solid #eee', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <strong>Devices:</strong>
        <small style={{ color: sseConnected ? '#2ecc71' : '#999' }}>{sseConnected ? 'SSE connected' : 'SSE disconnected'}</small>
      </div>
      <div style={{ marginTop: 8 }}>No devices found.</div>
    </div>
  );

  return (
    <div style={{ padding: 12, border: '1px solid #eee', marginBottom: 12 }}>
      <h2 style={{ margin: '0 0 8px 0' }}>Devices</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {devices.map((d) => (
          <li key={d.device_id} style={{ padding: 8, borderBottom: '1px solid #f2f2f2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong>{d.device_id}</strong>
                <div style={{ fontSize: 12, color: '#666' }}>lastSeen: {d.lastSeen ? new Date(d.lastSeen).toLocaleString() : '—'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  display: 'inline-block',
                  width: 10, height: 10, borderRadius: 6,
                  background: d.online ? '#2ecc71' : '#e74c3c', marginRight: 8
                }} />
                <span style={{ fontWeight: 600, marginRight: 8 }}>{d.online ? 'Online' : 'Offline'}</span>
                <small style={{ color: '#666' }}>{d.source || ((Date.now() - (d.lastSeen || 0)) <= ONLINE_THRESHOLD_MS ? 'inferred' : 'stale')}</small>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
