// Minimal client shim that provides the small subset of functionality
// `src/App.tsx` expects. This lets the app run against the provided
// `/api` endpoints without requiring full Amplify DataStore codegen.

export function generateClient<T = any>() {
  return {
    models: {
      Devices: {
        observeQuery: () => ({
          subscribe: ({ next }: any) => {
            // Fetch devices once and emit initial items.
            fetch('/api/devices')
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
          return fetch('/api/devices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj)}).catch(()=>{});
        },
        delete: (obj: any) => {
          return fetch(`/api/devices/${encodeURIComponent(obj.device_id)}`, { method: 'DELETE' }).catch(()=>{});
        }
      }
    }
  };
}
