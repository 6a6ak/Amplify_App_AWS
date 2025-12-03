import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

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
        const isProd = window.location.hostname.includes("amplifyapp.com");
        const apiUrl = isProd
          ? "https://stmaj0z5ri.execute-api.eu-central-1.amazonaws.com/dev/esp32"
          : undefined;

        if (apiUrl) {
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const json = await res.json();
          const list = Array.isArray(json.devices) ? json.devices : [];
          setDevices(list);
        } else {
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

  const temperatureChartData = React.useMemo(() => {
    const labels = devices.map((d) => d.device_id);
    const temps = devices.map((d) =>
      typeof d.lastItem?.temperature === "number" ? d.lastItem.temperature : null
    );

    return {
      labels,
      datasets: [
        {
          label: "Last temperature (°C)",
          data: temps,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          spanGaps: true,
        },
      ],
    };
  }, [devices]);

  const speedChartData = React.useMemo(() => {
    const labels = devices.map((d) => d.device_id);
    const speeds = devices.map((d) =>
      typeof d.lastItem?.speed === "number" ? d.lastItem.speed : null
    );

    return {
      labels,
      datasets: [
        {
          label: "Last speed",
          data: speeds,
          borderColor: "rgba(255, 159, 64, 1)",
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          spanGaps: true,
        },
      ],
    };
  }, [devices]);

  const plateSpeedChartData = React.useMemo(() => {
    const plateToSpeed: Record<string, number> = {};

    devices.forEach((d) => {
      const plate = d.lastItem?.plate as string | undefined;
      const speed = d.lastItem?.speed;

      if (plate && typeof speed === "number") {
        plateToSpeed[plate] = speed;
      }
    });

    const labels = Object.keys(plateToSpeed);
    const speeds = labels.map((p) => plateToSpeed[p]);

    return {
      labels,
      datasets: [
        {
          label: "Speed per plate",
          data: speeds,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          spanGaps: true,
        },
      ],
    };
  }, [devices]);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light text-dark pt-5">
      <header>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
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

      <main id="devices" className="flex-grow-1 py-4">
        <div className="container mt-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h1 className="h5 mb-0">ESP32 Fleet Devices</h1>
              <span className="badge bg-info text-dark">
                Total devices: {devices.length}
              </span>
            </div>
            <div className="card-body">
              {loading && <p className="mb-0">Loading devices…</p>}
              {error && !loading && (
                <p className="text-danger mb-0">Error: {error}</p>
              )}

              {plateSpeedChartData.labels.length > 0 && (
                <div className="mb-4" style={{ height: 260 }}>
                  <h2 className="h6 mb-3">Speed per plate</h2>
                  <Line
                    data={plateSpeedChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: true, position: "bottom" },
                      },
                      scales: {
                        x: {
                          title: { display: true, text: "Plate" },
                        },
                        y: {
                          title: { display: true, text: "Speed" },
                        },
                      },
                    }}
                  />
                </div>
              )}

              <div className="row g-3 mt-1">
                {devices.map((d) => (
                  <div className="col-12 col-md-6 col-lg-4" key={d.device_id}>
                    <div className="card h-100 border-info">
                      <div className="card-body py-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-uppercase text-info small">
                            Device ID:
                          </span>{" "}
                          {d.device_id}
                          {d.lastItem?.name ? ` — ${d.lastItem.name}` : ""}
                        </div>
                        <div className="small text-muted mt-2">
                          <span className="fw-light">Last seen:</span>{" "}
                          {d.lastSeen
                            ? new Date(d.lastSeen).toLocaleString()
                            : "unknown"}
                        </div>
                        <div className="small mt-1">
                          <span className="fw-light">Last temperature:</span>{" "}
                          {d.lastItem && typeof d.lastItem.temperature === "number"
                            ? `${d.lastItem.temperature} °C`
                            : "—"}
                        </div>
                        <div className="small mt-1">
                          <span className="fw-light">Last humidity:</span>{" "}
                          {d.lastItem && typeof d.lastItem.humidity === "number"
                            ? `${d.lastItem.humidity} %`
                            : "—"}
                        </div>
                        <div className="small mt-1">
                          <span className="fw-light">Last speed:</span>{" "}
                          {d.lastItem && typeof d.lastItem.speed === "number"
                            ? `${d.lastItem.speed}`
                            : "—"}
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

      {/* Admin page is now a dedicated route at /admin */}
    </div>
  );
}

export default App;
