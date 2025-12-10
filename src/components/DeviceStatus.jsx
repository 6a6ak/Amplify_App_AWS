import React, { useEffect, useState, useRef } from 'react';

export default function DeviceStatus({ apiBase = '' }) {
  const [devices, setDevices] = useState([]);
  const [sseConnected, setSseConnected] = useState(false);
  // Simplified base selection:
  // - Prefer explicit `apiBase` prop
  // - Else `VITE_API_BASE` if defined at build time
  // - Else use relative paths (same-origin)
  const base = apiBase || (import.meta?.env?.VITE_API_BASE || '');
  const evtSourceRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const devicesUrl = base ? (base + '/api/devices') : '/api/devices';
    fetch(devicesUrl)
      .then((r) => r.ok ? r.json() : Promise.reject('fetch-failed'))
      .then((j) => {
        const list = j.devices || [];
        // Normalize device objects to include a preferred name from telemetry or DB
        const norm = list.map((x) => ({
          ...x,
          name: x.lastItem?.name || x.name || null,
        }));
        mounted && setDevices(norm);
      })
      .catch(() => mounted && setDevices([]));

    // connect SSE
    const eventsUrl = base ? (base + '/api/events') : '/api/events';
    const es = new EventSource(eventsUrl);
    evtSourceRef.current = es;
    es.addEventListener('status', (e) => {
      try {
        const d = JSON.parse(e.data);
        setDevices((prev) => {
          const map = new Map(prev.map(x => [x.device_id, x]));
          const cur = map.get(d.device_id) || { device_id: d.device_id, lastSeen: d.lastSeen, lastItem: null, name: null };
            cur.lastSeen = d.lastSeen;
            cur.online = d.online;
            // preserve or update name if provided in SSE payload
            if (d.name) cur.name = d.name;
            if (d.lastItem?.name) cur.name = d.lastItem.name;
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
                <strong>{d.lastItem?.name || d.name || '(Unnamed device)'}</strong>
                <div style={{ fontSize: 12, color: '#666' }}>
                  lastSeen: {d.lastSeen ? new Date(d.lastSeen).toLocaleString() : '—'}
                  {d.lastItem && (
                    <>
                      {typeof d.lastItem.plate !== 'undefined' && (
                        <span style={{ marginLeft: 12 }}>
                          • Plate: <strong>{d.lastItem.plate}</strong>
                        </span>
                      )}
                      {typeof d.lastItem.speed !== 'undefined' && (
                        <span style={{ marginLeft: 12 }}>
                          • Speed: <strong>{d.lastItem.speed}</strong>
                        </span>
                      )}
                      {typeof d.lastItem.temperature !== 'undefined' && (
                        <span style={{ marginLeft: 12 }}>
                          • Temp: <strong>{d.lastItem.temperature}{typeof d.lastItem.temperature === 'number' ? '°C' : ''}</strong>
                        </span>
                      )}
                      {typeof d.lastItem.humidity !== 'undefined' && (
                        <span style={{ marginLeft: 12 }}>
                          • Humidity: <strong>{d.lastItem.humidity}{typeof d.lastItem.humidity === 'number' ? '%' : ''}</strong>
                        </span>
                      )}
                    </>
                  )}
                </div>
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
