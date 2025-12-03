import React from "react";
import { fetchAuthSession } from "aws-amplify/auth";

export default function AdminPage() {
  const [email, setEmail] = React.useState("");
  const [tempPassword, setTempPassword] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [statusMap, setStatusMap] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const session = await fetchAuthSession();
        const groups = (session.tokens?.idToken?.payload?.["cognito:groups"] as string[]) || [];
        setIsAdmin(groups.includes("admin"));
      } catch (e) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      const isDev = location.hostname === "localhost" || location.hostname === "127.0.0.1";
      if (!isDev) {
        setStatus("Admin invite is dev-only here. Wire a Lambda in production.");
        return;
      }
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, temporaryPassword: tempPassword || undefined, role: "admin" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Invite failed");
      setStatus("Admin user invited successfully.");
      setEmail("");
      setTempPassword("");
    } catch (e: any) {
      setStatus(e?.message || "Invite failed");
    }
  }

  async function refreshStatusMap() {
    try {
      const res = await fetch("/api/internal/status-map");
      const json = await res.json();
      if (res.ok) setStatusMap(json.items || []);
    } catch {}
  }

  React.useEffect(() => { refreshStatusMap(); }, []);

  if (loading) {
    return (
      <div className="container py-4">
        <h1 className="h5">Admin</h1>
        <div>Loading…</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-4">
        <h1 className="h5">Admin</h1>
        <div className="alert alert-warning">Access denied. You must be in the 'admin' group.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="h5 mb-3">Admin Panel</h1>

      <div className="card mb-4">
        <div className="card-header">Invite Admin User</div>
        <div className="card-body">
          <form onSubmit={invite} className="row g-2">
            <div className="col-12 col-md-6">
              <input
                type="email"
                className="form-control"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Temp password (optional)"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-2 d-grid">
              <button type="submit" className="btn btn-primary">Invite</button>
            </div>
          </form>
          {status && <div className="mt-2 small">{status}</div>}
          <div className="mt-2 small text-muted">
            Dev-only action: calls /api/admin/users. For production, expose a secured Lambda that performs AdminCreateUser.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Device Status Map</span>
          <button className="btn btn-sm btn-outline-secondary" onClick={refreshStatusMap}>Refresh</button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Last Seen</th>
                  <th>Online</th>
                </tr>
              </thead>
              <tbody>
                {statusMap.map((it) => (
                  <tr key={it.device_id}>
                    <td>{it.device_id}</td>
                    <td>{it.lastSeen ? new Date(it.lastSeen).toLocaleString() : "-"}</td>
                    <td>{String(it.online)}</td>
                  </tr>
                ))}
                {statusMap.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-muted small">No items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
