import React, { useEffect, useState } from 'react';

export default function SimpleStatus({ deviceId, apiBase = '' }) {
  const [status, setStatus] = useState({ online: false, lastSeen: 0, loading: true, error: '' });
  const base = apiBase || (import.meta?.env?.VITE_API_BASE || '');

  useEffect(() => {
    const shadowUrl = base ? (base + `/api/devices/${deviceId}/shadow`) : `/api/devices/${deviceId}/shadow`;
    const telemetryUrl = base ? (base + `/api/devices/${deviceId}`) : `/api/devices/${deviceId}`;

    let got = { online: false, lastSeen: 0, temp: null, name: null };

    fetch(shadowUrl)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(j => {
        got.online = !!j.online;
        got.lastSeen = j.lastSeen || 0;
      })
      .catch(() => {/* ignore shadow errors, proceed to telemetry */})
      .finally(() => {
        // fetch latest telemetry to show temperature and name
        fetch(telemetryUrl)
          .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
          .then(j => {
            const items = j.items || [];
            if (items.length > 0) {
              const latest = items[0];
              got.temp = (typeof latest.temperature !== 'undefined') ? latest.temperature : null;
              got.lastSeen = got.lastSeen || latest.timestamp || 0;
              got.name = latest.name || j.name || null;
            }
            setStatus({ online: !!got.online, lastSeen: got.lastSeen || 0, temp: got.temp, loading: false, error: '', name: got.name });
          })
          .catch(err => setStatus({ online: !!got.online, lastSeen: got.lastSeen || 0, temp: null, loading: false, error: String(err.message || err), name: null }));
      });
  }, [deviceId, apiBase]);

  const last = status.lastSeen ? new Date(status.lastSeen).toLocaleString() : '—';
  return (
    <div style={{ maxWidth: 420, margin: '24px auto', padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
      <h2 style={{ margin: 0, marginBottom: 12 }}>Device Status</h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, color: '#666' }}>Device</div>
          <div style={{ fontWeight: 600 }}>{status.name || '(Unnamed device)'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 6, background: status.online ? '#2ecc71' : '#e74c3c', marginRight: 8 }} />
          <span style={{ fontWeight: 600 }}>{status.loading ? 'Loading…' : status.online ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Last seen: {last}</div>
      {status.temp !== null && (
        <div style={{ marginTop: 8, fontSize: 16 }}>Temperature: <strong>{status.temp}{typeof status.temp === 'number' ? '°C' : ''}</strong></div>
      )}
      {status.error && <div style={{ marginTop: 10, color: '#e74c3c', fontSize: 12 }}>Error: {status.error}</div>}
    </div>
  );
}
