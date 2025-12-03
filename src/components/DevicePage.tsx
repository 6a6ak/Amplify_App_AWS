import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

function useDevices() {
  const [devices, setDevices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const isProd = window.location.hostname.includes("amplifyapp.com");
        const apiUrl = isProd
          ? "https://stmaj0z5ri.execute-api.eu-central-1.amazonaws.com/dev/esp32"
          : "/api/devices";
        const res = await fetch(apiUrl, {
          method: isProd ? "POST" : "GET",
          headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();
        const list = Array.isArray(json.devices) ? json.devices : [];
        setDevices(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load devices");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { devices, loading, error };
}

export function DeviceList() {
  const { devices, loading, error } = useDevices();

  return (
    <div className="d-flex flex-column min-vh-100 pt-5">
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
                  <Link className="nav-link active" to="/devices">
                    Devices
                  </Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#about">
                    About
                  </a>
                </li>
              </ul>
              <Link
                to="/admin"
                className="btn btn-sm btn-outline-light ms-lg-3"
                title="Admin settings"
              >
                <i className="fa fa-cog" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-grow-1">
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="h5 mb-0">Devices</h1>
          </div>
          {loading && <p>Loading devices…</p>}
          {error && <p className="text-danger">{error}</p>}
          <div className="row g-3">
            {devices.map((d) => (
              <div key={d.device_id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="small text-muted">Device ID</div>
                        <div>{d.device_id}</div>
                      </div>
                      <Link
                        to={`/devices/${encodeURIComponent(d.device_id)}`}
                        className="btn btn-sm btn-primary"
                      >
                        View
                      </Link>
                    </div>
                    <div className="small mt-2">
                      Last temp:{" "}
                      {typeof d.lastItem?.temperature === "number"
                        ? d.lastItem.temperature + " °C"
                        : "-"}
                    </div>
                    <div className="small">
                      Last speed:{" "}
                      {typeof d.lastItem?.speed === "number"
                        ? d.lastItem.speed
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!loading && devices.length === 0 && !error && (
              <p className="text-muted">No devices found.</p>
            )}
          </div>
        </div>
      </main>
      <section className="py-4 bg-white border-top mt-auto">
        <div className="container text-center small text-muted">
          Devices section
        </div>
      </section>
    </div>
  );
}

export default function DevicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { devices, loading, error } = useDevices();

  const device = React.useMemo(
    () => devices.find((d) => d.device_id === id),
    [devices, id]
  );

  if (!id) return <DeviceList />;

  return (
    <div className="d-flex flex-column min-vh-100 pt-5">
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
                  <Link className="nav-link active" to="/devices">
                    Devices
                  </Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#about">
                    About
                  </a>
                </li>
              </ul>
              <Link
                to="/admin"
                className="btn btn-sm btn-outline-light ms-lg-3"
                title="Admin settings"
              >
                <i className="fa fa-cog" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-grow-1">
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="h5 mb-0">Device: {id}</h1>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
              <Link to="/devices" className="btn btn-outline-primary btn-sm">
                All Devices
              </Link>
            </div>
          </div>
          {loading && <p>Loading…</p>}
          {error && <p className="text-danger">{error}</p>}
          {!loading && !device && !error && (
            <p className="text-muted">Device not found.</p>
          )}

          {device && (
            <div className="card">
              <div className="card-header d-flex align-items-center gap-3">
                <span className="badge bg-info">Overview</span>
                <span className="small text-muted">
                  Last seen:{" "}
                  {device.lastSeen
                    ? new Date(device.lastSeen).toLocaleString()
                    : "-"}
                </span>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <div className="card h-100">
                      <div className="card-header">Daily</div>
                      <div className="card-body">
                        <div className="small text-muted">Placeholder</div>
                        <div>
                          Temp:{" "}
                          {typeof device.lastItem?.temperature === "number"
                            ? device.lastItem.temperature + " °C"
                            : "-"}
                        </div>
                        <div>
                          Humidity:{" "}
                          {typeof device.lastItem?.humidity === "number"
                            ? device.lastItem.humidity + " %"
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="card h-100">
                      <div className="card-header">Monthly</div>
                      <div className="card-body">
                        <div className="small text-muted">Placeholder</div>
                        <div>
                          Speed:{" "}
                          {typeof device.lastItem?.speed === "number"
                            ? device.lastItem.speed
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="card h-100">
                      <div className="card-header">Telemetry</div>
                      <div className="card-body">
                        <pre
                          className="small mb-0"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {JSON.stringify(device.lastItem, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <section className="py-4 bg-white border-top mt-auto">
        <div className="container text-center small text-muted">
          Device details
        </div>
      </section>
    </div>
  );
}
