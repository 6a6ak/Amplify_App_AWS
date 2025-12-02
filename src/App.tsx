import React, { useEffect, useState } from "react";

type Device = {
  device_id: string;
  lastSeen?: number;
  lastItem?: any;
};

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Try external API Gateway if configured
        const apiUrl = (import.meta as any)?.env?.VITE_DATA_API_URL as
          | string
          | undefined;
        if (apiUrl) {
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const json = await res.json();
          const list = Array.isArray(json.devices) ? json.devices : [];
          setDevices(list);
        } else {
          // Fallback to local Node server
          const res = await fetch("/api/devices");
          const json = await res.json();
          const list = Array.isArray(json.devices) ? json.devices : [];
          setDevices(list);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load devices");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light text-dark pt-5">
      <header>
        <nav
          className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top"
        >
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
                  <a className="nav-link" href="#devices">
                    Devices
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#telemetry">
                    Telemetry
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#about">
                    About
                  </a>
                </li>
              </ul>

              <i className="fa fa-cog text-light ms-lg-3" aria-hidden="true" />
            </div>
          </div>
        </nav>
      </header>

      <main id="devices" className="flex-grow-1 mt-5">
        <div className="container py-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-baseline mb-3">
                <div>
                  <h1 className="h4 mb-1">ESP32 Fleet Devices</h1>
                  <small className="text-muted">
                    Live status and last-seen time for each device in your fleet.
                  </small>
                </div>
                <span className="text-uppercase small text-muted">
                  Total: {devices.length}
                </span>
              </div>

              {loading && <p className="text-muted mb-3">Loading…</p>}
              {error && (
                <p className="text-danger mb-3">Error: {error}</p>
              )}

              <div className="row g-3">
                {devices.map((d) => (
                  <div className="col-12 col-md-6 col-lg-4" key={d.device_id}>
                    <div className="card h-100 border-info">
                      <div className="card-body py-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-uppercase text-info small">
                            Device
                          </span>
                          <span className="text-muted small">ID</span>
                        </div>
                        <div className="fw-semibold small text-break">
                          {d.device_id}
                        </div>
                        <div className="small text-muted mt-2">
                          <span className="fw-light">Last seen:</span>{" "}
                          {d.lastSeen
                            ? new Date(d.lastSeen).toLocaleString()
                            : "unknown"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!loading && devices.length === 0 && !error && (
                  <p className="text-muted col-12 mb-0">
                    No devices found. Check API configuration.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <section id="about" className="py-4 bg-white border-top mt-auto">
        <div className="container text-center small text-muted">
          About section (for navbar link).
        </div>
      </section>
    </div>
  );
}

export default App;
