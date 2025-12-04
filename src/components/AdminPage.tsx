import React from "react";
import { Link } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";

export default function AdminPage() {
  const ONLINE_WINDOW_MS = 30 * 1000; // consider online only if seen within 30s
  const [email, setEmail] = React.useState("");
  const [tempPassword, setTempPassword] = React.useState("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [statusMap, setStatusMap] = React.useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { user, signOut } = useAuthenticator((ctx) => [ctx.user, ctx.signOut]);

  React.useEffect(() => {
    // derive admin group from signed-in user token payload if available
    try {
      const groups =
        (user &&
          ((user as any)?.signInUserSession?.idToken?.payload?.[
            "cognito:groups"
          ] ||
            (user as any)?.attributes?.["cognito:groups"])) ||
        [];
      const grpArr = Array.isArray(groups)
        ? groups
        : typeof groups === "string"
        ? [groups]
        : [];
      setIsAdmin(grpArr.includes("admin"));
    } catch (e) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      const isDev =
        location.hostname === "localhost" || location.hostname === "127.0.0.1";
      if (!isDev) {
        setStatus(
          "Admin invite is dev-only here. Wire a Lambda in production."
        );
        return;
      }
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          temporaryPassword: tempPassword || undefined,
          role: "admin",
        }),
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
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const isProd = window.location.hostname.includes("amplifyapp.com");
      const res = await fetch("/api/internal/status-map");
      const json = await res.json();
      if (res.ok) {
        const items = json.items || [];
        if (Array.isArray(items) && items.length > 0) {
          const normalized = items.map((it: any) => {
            const last =
              typeof it.lastSeen === "number"
                ? it.lastSeen
                : it.timestamp ?? null;
            const online =
              typeof last === "number"
                ? Date.now() - last < ONLINE_WINDOW_MS
                : false;
            return { device_id: it.device_id, lastSeen: last, online };
          });
          setStatusMap(normalized);
          return;
        }
      }
    } catch {}

    try {
      const isProd = window.location.hostname.includes("amplifyapp.com");
      const apiUrl = isProd
        ? "https://stmaj0z5ri.execute-api.eu-central-1.amazonaws.com/dev/esp32"
        : "/api/devices";
      const res2 = await fetch(apiUrl, {
        method: isProd ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
      });
      const json2 = await res2.json();
      const list = Array.isArray(json2.devices) ? json2.devices : [];
      const mapped = list.map((d: any) => {
        const last =
          typeof d.lastSeen === "number"
            ? d.lastSeen
            : d.lastItem?.timestamp ?? null;
        const online =
          typeof last === "number"
            ? Date.now() - last < ONLINE_WINDOW_MS
            : false;
        return { device_id: d.device_id, lastSeen: last, online };
      });
      setStatusMap(mapped);
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  }

  React.useEffect(() => {
    refreshStatusMap();
    const id = setInterval(() => refreshStatusMap(), 10 * 1000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="container py-4">
        <h1 className="h5">Admin</h1>
        <div>Loading…</div>
      </div>
    );
  }

  // Always render page with navbar; show access message in content if not admin

  return (
    <div className="d-flex flex-column min-vh-100 pt-5">
      <style>{`
        .admin-gradient {
          background: linear-gradient(90deg, #0d6efd 0%, #20c997 50%, #6610f2 100%);
        }
        .admin-card-shadow { box-shadow: 0 0.3rem 0.8rem rgba(0,0,0,0.08); }
        .table-status .badge { min-width: 64px; }
      `}</style>
      <header>
        <nav className="navbar navbar-expand-lg navbar-dark admin-gradient fixed-top">
          <div className="container-fluid">
            <a className="navbar-brand fw-semibold" href="#devices">
              ESP32 Dashboard
            </a>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarContent"
              aria-controls="navbarContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>

            <div className="collapse navbar-collapse" id="navbarContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/devices">
                    Devices
                  </Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#about">
                    About
                  </a>
                </li>
              </ul>
              <div className="d-flex align-items-center gap-2">
                <Link
                  to="/"
                  className="btn btn-sm btn-outline-light"
                  title="Home"
                >
                  Home
                </Link>
                <Link
                  to="/admin"
                  className="btn btn-sm btn-outline-light"
                  title="Admin settings"
                >
                  <i className="fa fa-cog" aria-hidden="true" />
                </Link>
                {user && (
                  <>
                    <span className="text-white small d-none d-md-inline">
                      {(user as any)?.attributes?.email ||
                        (user as any)?.username}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-light"
                      onClick={() => {
                        const cur =
                          document.documentElement.getAttribute("data-theme");
                        const next = cur === "dark" ? "light" : "dark";
                        document.documentElement.setAttribute(
                          "data-theme",
                          next
                        );
                        try {
                          localStorage.setItem("theme", next);
                        } catch {}
                      }}
                      title="Toggle dark/light"
                    >
                      {document.documentElement.getAttribute("data-theme") ===
                      "dark" ? (
                        <i className="fa fa-sun" aria-hidden="true" />
                      ) : (
                        <i className="fa fa-moon" aria-hidden="true" />
                      )}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-light"
                      onClick={() => signOut()}
                      title="Sign out"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow-1 py-4">
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="h5 mb-0 text-primary">Admin Panel</h1>
          </div>

          {/* Access denied message removed as requested */}

          {/* Invite admin container removed as requested */}
          <div id="devices" className="card admin-card-shadow">
            <div className="card-header d-flex justify-content-between align-items-center bg-warning bg-opacity-10">
              <span>Device Status Map</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={refreshStatusMap}
                disabled={isRefreshing}
                title={isRefreshing ? "Refreshing…" : "Refresh device status"}
              >
                {isRefreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0 table-status">
                  <thead>
                    <tr>
                      <th>Device ID</th>
                      <th>Last Seen</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusMap.map((it) => (
                      <tr
                        key={it.device_id}
                        className={it.online ? "table-success" : "table-danger"}
                      >
                        <td>{it.device_id}</td>
                        <td>
                          {it.lastSeen
                            ? new Date(it.lastSeen).toLocaleString()
                            : "-"}
                        </td>
                        <td>
                          {it.online ? (
                            <span className="badge bg-success">Online</span>
                          ) : (
                            <span className="badge bg-danger">Offline</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {statusMap.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-muted small">
                          No items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="py-4 bg-white border-top mt-auto">
        <div className="container text-center small text-muted">
          Admin section
        </div>
      </section>
    </div>
  );
}
