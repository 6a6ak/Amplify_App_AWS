// Minimal client shim that provides the small subset of functionality
// `src/App.tsx` expects. This lets the app run against the provided
// `/api` endpoints without requiring full Amplify DataStore codegen.

export function generateClient<T = any>() {
  // Resolve base URL from Vite environment (injected at build time).
  // If not set, fall back to local `/api/devices` endpoint.
  const meta: any = (import.meta as any) || {};
  const BASE = meta.env && meta.env.VITE_DATA_API_URL ? String(meta.env.VITE_DATA_API_URL).replace(/\/$/, '') : '';
  const API_KEY = meta.env && meta.env.VITE_DATA_API_KEY ? String(meta.env.VITE_DATA_API_KEY) : null;

  async function fetchDevices() {
    // If a VITE_DATA_API_URL is configured, call the external API Gateway
    // which is expected to return `{ devices: [...] }` on POST.
    if (BASE) {
      try {
        const res = await fetch(BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(API_KEY ? { 'x-api-key': API_KEY } : {})
          },
          body: JSON.stringify({})
        });
        const json = await res.json();
        if (Array.isArray(json.devices)) return json.devices;
        if (Array.isArray(json)) return json;
        return [];
      } catch (e) {
        // fall through to local fallback
      }
    }

    // Fallback: use local Node server `/api/devices` if running
    try {
      const res = await fetch('/api/devices');
      const json = await res.json();
      if (Array.isArray(json.devices)) return json.devices;
      if (Array.isArray(json)) return json;
      return [];
    } catch (e) {
      return [];
    }
  }

  function headersJson() {
    const h: Record<string,string> = { 'Content-Type': 'application/json' };
    if (API_KEY) h['x-api-key'] = API_KEY;
    return h;
  }

  return {
    models: {
      Devices: {
        observeQuery: () => ({
          subscribe: ({ next }: any) => {
            fetchDevices()
              .then((items) => {
                try { next({ items }); } catch (e) { /* ignore */ }
              })
              .catch(() => {
                try { next({ items: [] }); } catch (e) {}
              });
            return { unsubscribe() {} };
          }
        }),
        create: (obj: any) => {
          // When using external API Gateway, there may be a different endpoint
          // for creation; for now, only support local `/api/devices` create.
          return fetch('/api/devices', { method: 'POST', headers: headersJson(), body: JSON.stringify(obj)}).catch(()=>{});
        },
        delete: (obj: any) => {
          // Likewise, support delete only on local server for now.
          return fetch(`/api/devices/${encodeURIComponent(obj.device_id)}`, { method: 'DELETE', headers: headersJson() }).catch(()=>{});
        }
      }
    }
  };
}
