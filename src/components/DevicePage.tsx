import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ONLINE_WINDOW_MS = 30 * 1000;

// Plugin to paint chart canvas background creamy off-white
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
          backgroundColor: "rgba(10, 147, 150, 0.5)", // #0a9396
          borderColor: "rgba(10, 147, 150, 1)",
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
          backgroundColor: "rgba(0, 95, 115, 0.5)", // #005f73
          borderColor: "rgba(0, 95, 115, 1)",
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
          backgroundColor: "rgba(0, 18, 25, 0.5)", // #001219
          borderColor: "rgba(0, 18, 25, 1)",
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
                  <Link className="nav-link active" to="/devices">
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
      <main className="flex-grow-1" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="h5 mb-0">Devices</h1>
          </div>
          {loading && <p>Loading devices…</p>}
          {error && <p className="text-danger">{error}</p>}
          <div className="row g-3">
            <div className="col-12">
              <div className="card mb-3">
                <div className="card-header">
                  Daily online devices (last 7 days)
                </div>
                <div
                  className="card-body"
                  style={{ height: 240, backgroundColor: "#46b1c9" }}
                >
                  <Bar
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
              </div>
            </div>
            <div className="col-12">
              <div className="card mb-3">
                <div className="card-header">
                  Monthly online devices (last 12 months)
                </div>
                <div
                  className="card-body"
                  style={{ height: 240, backgroundColor: "#46b1c9" }}
                >
                  <Bar
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
              </div>
            </div>
            <div className="col-12">
              <div className="card mb-3">
                <div className="card-header">
                  Yearly online devices (last 3 years)
                </div>
                <div
                  className="card-body"
                  style={{ height: 240, backgroundColor: "#46b1c9" }}
                >
                  <Bar
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
      <section
        className="py-4 border-top mt-auto"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
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
          <div className="container">
            <Link
              className="navbar-brand fw-semibold d-flex align-items-center"
              to="/"
            >
              <i className="fa fa-car" aria-hidden="true" />
            </Link>
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
                <div className="d-flex align-items-center gap-2">
                  <span
                    className={`badge ${
                      device.lastSeen &&
                      Date.now() - device.lastSeen < ONLINE_WINDOW_MS
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {device.lastSeen &&
                    Date.now() - device.lastSeen < ONLINE_WINDOW_MS
                      ? "Online"
                      : "Offline"}
                  </span>
                  <span className="small text-muted">
                    Last seen:{" "}
                    {device.lastSeen
                      ? new Date(device.lastSeen).toLocaleString()
                      : "-"}
                  </span>
                </div>
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
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <span>Telemetry</span>
                        <div>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              navigator.clipboard?.writeText(
                                JSON.stringify(device.lastItem || {}, null, 2)
                              )
                            }
                            title="Copy JSON"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        {device.lastItem &&
                        typeof device.lastItem === "object" ? (
                          <table className="table table-sm mb-0">
                            <tbody>
                              {Object.entries(device.lastItem).map(([k, v]) => (
                                <tr key={k}>
                                  <th
                                    style={{ width: "40%" }}
                                    className="align-top"
                                  >
                                    {k}
                                  </th>
                                  <td className="small">
                                    {v === null || v === undefined
                                      ? "—"
                                      : typeof v === "object"
                                      ? JSON.stringify(v)
                                      : String(v)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="small text-muted">
                            No telemetry available.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <section
        className="py-4 border-top mt-auto"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        <div className="container text-center small text-muted">
          Device details
        </div>
      </section>
    </div>
  );
}
