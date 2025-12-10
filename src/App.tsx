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
// Import slideshow images from src/assets/img for reliable bundling
import slide1 from "./assets/img/slider.png";
import slide2 from "./assets/img/slider01.png";
import slide3 from "./assets/img/slider02.png";

// Plugin to paint line chart canvas background creamy off-white
const chartBgPlugin = {
  id: "chartBgPlugin",
  beforeDraw: (chart: any) => {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#f7f4ef"; // creamy off-white
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  },
};

const ONLINE_THRESHOLD_MS = 60000; // 60s - consider device online if lastSeen within this window

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
          const norm = list.map((x: any) => ({ ...x, name: x.lastItem?.name || x.name || null }));
          setDevices(norm);
        } else {
          const res = await fetch("/api/devices");
          const json = await res.json();
          const list = Array.isArray(json.devices) ? json.devices : [];
          const norm = list.map((x: any) => ({ ...x, name: x.lastItem?.name || x.name || null }));
          setDevices(norm);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load devices");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Removed unused temperature and speed chart data builders

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

  // Aggregated charts: daily, monthly, yearly counts and speed overview
  const dailyData = React.useMemo(() => {
    const now = Date.now();
    const buckets: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 3600 * 1000);
      const key = d.toLocaleDateString();
      buckets[key] = 0;
    }
    devices.forEach((dev) => {
      const ls =
        typeof dev.lastSeen === "number"
          ? dev.lastSeen
          : dev.lastItem?.timestamp;
      if (typeof ls === "number") {
        const day = new Date(ls).toLocaleDateString();
        if (day in buckets) buckets[day] += 1;
      }
    });
    const labels = Object.keys(buckets);
    return {
      labels,
      datasets: [
        {
          label: "Devices seen per day (7d)",
          data: labels.map((l) => buckets[l]),
          borderColor: "rgba(10, 147, 150, 1)",
          backgroundColor: "rgba(10, 147, 150, 0.2)",
          tension: 0.3,
        },
      ],
    };
  }, [devices]);

  const monthlyData = React.useMemo(() => {
    const now = new Date();
    const buckets: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      buckets[key] = 0;
    }
    devices.forEach((dev) => {
      const ls =
        typeof dev.lastSeen === "number"
          ? dev.lastSeen
          : dev.lastItem?.timestamp;
      if (typeof ls === "number") {
        const dt = new Date(ls);
        const key = `${dt.getFullYear()}-${(dt.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        if (key in buckets) buckets[key] += 1;
      }
    });
    const labels = Object.keys(buckets);
    return {
      labels,
      datasets: [
        {
          label: "Devices seen per month (12m)",
          data: labels.map((l) => buckets[l]),
          borderColor: "rgba(0, 95, 115, 1)",
          backgroundColor: "rgba(0, 95, 115, 0.2)",
          tension: 0.3,
        },
      ],
    };
  }, [devices]);

  const yearlyData = React.useMemo(() => {
    const now = new Date();
    const buckets: Record<string, number> = {};
    for (let i = 2; i >= 0; i--) {
      const year = now.getFullYear() - i;
      buckets[String(year)] = 0;
    }
    devices.forEach((dev) => {
      const ls =
        typeof dev.lastSeen === "number"
          ? dev.lastSeen
          : dev.lastItem?.timestamp;
      if (typeof ls === "number") {
        const year = new Date(ls).getFullYear();
        const key = String(year);
        if (key in buckets) buckets[key] += 1;
      }
    });
    const labels = Object.keys(buckets);
    return {
      labels,
      datasets: [
        {
          label: "Devices seen per year (3y)",
          data: labels.map((l) => buckets[l]),
          borderColor: "rgba(0, 18, 25, 1)",
          backgroundColor: "rgba(0, 18, 25, 0.2)",
          tension: 0.3,
        },
      ],
    };
  }, [devices]);

  return (
    <div className="d-flex flex-column min-vh-100 pt-5">
      <header>
        <nav className="navbar navbar-expand-lg navbar-dark admin-gradient fixed-top">
          <div className="container">
            <a
              className="navbar-brand fw-semibold d-flex align-items-center"
              href="/"
            >
              <i className="fa fa-car" aria-hidden="true" />
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
                  <Link className="nav-link" to="/about">
                    About
                  </Link>
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

      <main
        id="devices"
        className="flex-grow-1 py-4"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="container mt-4">
          {/* Hero slideshow (Bootstrap Carousel) */}
          <div
            id="heroCarousel"
            className="carousel slide mb-4"
            data-bs-ride="carousel"
          >
            <div className="carousel-indicators">
              <button
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to="0"
                className="active"
                aria-current="true"
                aria-label="Slide 1"
              ></button>
              <button
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to="1"
                aria-label="Slide 2"
              ></button>
              <button
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to="2"
                aria-label="Slide 3"
              ></button>
            </div>
            <div className="carousel-inner rounded-3 overflow-hidden">
              <div className="carousel-item active">
                <img
                  src={slide1}
                  className="d-block w-100"
                  alt="Roadside sensor and vehicle"
                />
                <div className="carousel-caption d-none d-md-block">
                  <h5>Smart Roadside Sensing</h5>
                  <p>Real-time telemetry from your fleet devices.</p>
                </div>
              </div>
              <div className="carousel-item">
                <img
                  src={slide2}
                  className="d-block w-100"
                  alt="Sensor close-up"
                />
                <div className="carousel-caption d-none d-md-block">
                  <h5>Accurate Measurements</h5>
                  <p>Speed, temperature, and more at a glance.</p>
                </div>
              </div>
              <div className="carousel-item">
                <img
                  src={slide3}
                  className="d-block w-100"
                  alt="Car passing by"
                />
                <div className="carousel-caption d-none d-md-block">
                  <h5>Fleet Insights</h5>
                  <p>Daily, monthly, yearly trends for decisions.</p>
                </div>
              </div>
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
          {/* Aggregated charts section */}
          {/* Devices list - moved up to appear right after the hero slider */}
          <div className="card shadow-sm">
            <div
              className="card-header border-0 d-flex justify-content-between align-items-center"
              style={{ backgroundColor: "var(--card-bg)" }}
            >
              <h1 className="h5 mb-0">ESP Devices</h1>
              <span className="badge bg-info">
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
                    plugins={[chartBgPlugin]}
                  />
                </div>
              )}

              <div className="row g-3 mt-1">
                {devices.map((d) => (
                  <div className="col-12 col-md-6 col-lg-4" key={d.device_id}>
                    <div className="card h-100 border-info">
                      <div className="card-body py-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{
                              display: 'inline-block',
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              background: (d.lastSeen && (Date.now() - d.lastSeen) <= ONLINE_THRESHOLD_MS) ? '#28a745' : '#dc3545',
                              border: '2px solid #fff',
                              boxShadow: '0 0 6px rgba(0,0,0,0.18)'
                            }} title={(d.lastSeen && (Date.now() - d.lastSeen) <= ONLINE_THRESHOLD_MS) ? 'Online' : 'Offline'} />
                            <span className="text-uppercase text-info small">Device:</span>{' '}
                            <span className="fw-semibold">{d.lastItem?.name || d.name || '(Unnamed device)'}</span>
                          </div>
                        </div>
                        <div className="small text-muted mt-2">
                          <span className="fw-light">Last seen:</span>{" "}
                          {d.lastSeen
                            ? new Date(d.lastSeen).toLocaleString()
                            : "unknown"}
                        </div>
                        <div className="small mt-1">
                          <span className="fw-light">Last temperature:</span>{" "}
                          {d.lastItem &&
                          typeof d.lastItem.temperature === "number"
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
          <div className="card shadow-sm mb-4">
            <div
              className="card-header border-0 d-flex justify-content-between align-items-center"
              style={{ backgroundColor: "var(--card-bg)" }}
            >
              <h2 className="h6 mb-0">Fleet Activity</h2>
            </div>
            <div className="card-body overflow-hidden">
              <div className="mb-5" style={{ height: 220 }}>
                <h3 className="h6 mb-2">Daily (7d)</h3>
                <Line
                  data={dailyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: "bottom" },
                    },
                    scales: {
                      x: { title: { display: true, text: "Day" } },
                      y: { beginAtZero: true },
                    },
                  }}
                  plugins={[chartBgPlugin]}
                />
              </div>
              <div className="mb-5" style={{ height: 220 }}>
                <h3 className="h6 mb-2">Monthly (12m)</h3>
                <Line
                  data={monthlyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: "bottom" },
                    },
                    scales: {
                      x: { title: { display: true, text: "Month" } },
                      y: { beginAtZero: true },
                    },
                  }}
                  plugins={[chartBgPlugin]}
                />
              </div>
              <div className="mb-5" style={{ height: 220 }}>
                <h3 className="h6 mb-2">Yearly (3y)</h3>
                <Line
                  data={yearlyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: "bottom" },
                    },
                    scales: {
                      x: { title: { display: true, text: "Year" } },
                      y: { beginAtZero: true },
                    },
                  }}
                  plugins={[chartBgPlugin]}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <section
        id="about"
        className="py-4 border-top mt-auto"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        <div className="container text-center small text-muted">
          About section (for navbar link).
        </div>
      </section>

      {/* Admin page is now a dedicated route at /admin */}
    </div>
  );
}

export default App;
