// Minimal client shim that provides the small subset of functionality
// `src/App.tsx` expects. This lets the app run against the provided
// `/api` endpoints without requiring full Amplify DataStore codegen.

export function generateClient<T = any>() {
  // Resolve base URL from Vite environment (injected at build time) or
  // fallback to empty string to use same-origin `/api` paths.
  const meta: any = (import.meta as any) || {};
  const BASE = meta.env && meta.env.VITE_DATA_API_URL ? String(meta.env.VITE_DATA_API_URL).replace(/\/$/, '') : '';
  const API_KEY = meta.env && meta.env.VITE_DATA_API_KEY ? String(meta.env.VITE_DATA_API_KEY) : null;

  function buildUrl(path: string) {
    if (!BASE) return path.startsWith('/') ? path : `/${path}`;
    return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
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
            // Fetch devices once and emit initial items.
            fetch(buildUrl('/devices'), { headers: API_KEY ? { 'x-api-key': API_KEY } : undefined })
              .then((r) => r.json())
              .then((d) => {
                const items = d && d.devices ? d.devices : (Array.isArray(d) ? d : []);
                try { next({ items }); } catch (e) { /* ignore */ }
              })
              .catch(() => { try { next({ items: [] }); } catch (e) {} });
            return { unsubscribe() {} };
          }
        }),
        create: (obj: any) => {
          return fetch(buildUrl('/devices'), { method: 'POST', headers: headersJson(), body: JSON.stringify(obj)}).catch(()=>{});
        },
        delete: (obj: any) => {
          return fetch(buildUrl(`/devices/${encodeURIComponent(obj.device_id)}`), { method: 'DELETE', headers: API_KEY ? { 'x-api-key': API_KEY } : undefined }).catch(()=>{});
        }
      }
    }
  };
}
