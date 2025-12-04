import React from "react";
import { Link } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
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

export default function AdminPage() {
  const ONLINE_WINDOW_MS = 30 * 1000;
  const [statusMap, setStatusMap] = React.useState<any[]>([]);
  const [topSpeeds, setTopSpeeds] = React.useState<Array<any>>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { user, signOut } = useAuthenticator((ctx) => [ctx.user, ctx.signOut]);

  const chartBgPlugin = React.useMemo(
    () => ({
      id: "chartBgPlugin",
      beforeDraw: (chart: any) => {
        const { ctx, width, height } = chart;
        ctx.save();
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "#f7f4ef";
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      },
    }),
    []
  );

  async function refreshStatusMap() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
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
          // try to extract plate/speed info if available in items
          try {
            const speeds: Array<any> = [];
            items.forEach((it: any) => {
              const plate = it.lastItem?.plate || it.plate || null;
              const speed =
                typeof it.lastItem?.speed === "number"
                  ? it.lastItem.speed
                  : typeof it.speed === "number"
                  ? it.speed
                  : null;
              const ts =
                typeof it.lastItem?.timestamp === "number"
                  ? it.lastItem.timestamp
                  : it.timestamp ?? null;
              if (plate && typeof speed === "number")
                speeds.push({ plate, speed, device_id: it.device_id, ts });
            });
            if (speeds.length > 0) {
              // reduce to best speed per plate
              const byPlate: Record<string, any> = {};
              speeds.forEach((s) => {
                const existing = byPlate[s.plate];
                if (!existing || s.speed > existing.speed) byPlate[s.plate] = s;
              });
              const list = Object.values(byPlate)
                .sort((a: any, b: any) => b.speed - a.speed)
                .slice(0, 5);
              setTopSpeeds(list);
            }
          } catch (e) {}
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
      // compute top speeds by plate from device list
      try {
        const speeds: Array<any> = [];
        list.forEach((d: any) => {
          const plate = d.lastItem?.plate || d.plate || null;
          const speed =
            typeof d.lastItem?.speed === "number"
              ? d.lastItem.speed
              : typeof d.speed === "number"
              ? d.speed
              : null;
          const ts =
            typeof d.lastItem?.timestamp === "number"
              ? d.lastItem.timestamp
              : d.lastItem?.ts ?? null;
          if (plate && typeof speed === "number")
            speeds.push({ plate, speed, device_id: d.device_id, ts });
        });
        if (speeds.length > 0) {
          const byPlate: Record<string, any> = {};
          speeds.forEach((s) => {
            const existing = byPlate[s.plate];
            if (!existing || s.speed > existing.speed) byPlate[s.plate] = s;
          });
          const top = Object.values(byPlate)
            .sort((a: any, b: any) => b.speed - a.speed)
            .slice(0, 5);
          setTopSpeeds(top);
        } else {
          setTopSpeeds([]);
        }
      } catch (e) {
        setTopSpeeds([]);
      }
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

  const dailyData = React.useMemo(() => {
    const now = Date.now();
    const buckets: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 3600 * 1000);
      const key = d.toLocaleDateString();
      buckets[key] = 0;
    }
    statusMap.forEach((it) => {
      const ls = typeof it.lastSeen === "number" ? it.lastSeen : null;
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
          backgroundColor: "rgba(10, 147, 150, 0.5)",
          borderColor: "rgba(10, 147, 150, 1)",
        },
      ],
    };
  }, [statusMap]);

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
    statusMap.forEach((it) => {
      const ls = typeof it.lastSeen === "number" ? it.lastSeen : null;
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
          backgroundColor: "rgba(0, 95, 115, 0.5)",
          borderColor: "rgba(0, 95, 115, 1)",
        },
      ],
    };
  }, [statusMap]);

  const yearlyData = React.useMemo(() => {
    const now = new Date();
    const buckets: Record<string, number> = {};
    for (let i = 2; i >= 0; i--) {
      const year = now.getFullYear() - i;
      buckets[String(year)] = 0;
    }
    statusMap.forEach((it) => {
      const ls = typeof it.lastSeen === "number" ? it.lastSeen : null;
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
          backgroundColor: "rgba(0, 18, 25, 0.5)",
          borderColor: "rgba(0, 18, 25, 1)",
        },
      ],
    };
  }, [statusMap]);

  const onlineCount = statusMap.filter((s) => s.online).length;
  const offlineCount = statusMap.length - onlineCount;

  return (
    <div className="d-flex flex-column min-vh-100 pt-5">
      <style>{`.admin-gradient{background:linear-gradient(90deg,#0d6efd 0%,#20c997 50%,#6610f2 100%)} .admin-card-shadow{box-shadow:0 .3rem .8rem rgba(0,0,0,.08)} .table-status .badge{min-width:64px} .status-map-header{background:#ff8c00;color:#fff;border-bottom:1px solid rgba(255,255,255,0.18)} .status-map-header .small{color:#0b1220} .status-count{font-weight:600; background:#0b1220; color:#ffffff; padding:0.15rem 0.5rem; border-radius:0.35rem; display:inline-block; margin:0 0.25rem} .table-status thead th{background:transparent;border-bottom:1px solid rgba(255,255,255,0.08); color: #fff} .table-status td, .table-status th{vertical-align:middle}
    /* Refresh icon styles */
    .status-map-header .refresh-btn{padding:0.2rem 0.45rem;display:inline-flex;align-items:center;gap:0.5rem}
    .status-map-header .refresh-icon{width:28px;height:28px;border-radius:50%;background:#ffffff;color:#0b1220;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 1px 2px rgba(0,0,0,0.12);transition:transform .2s linear}
    .status-map-header .refresh-icon.refreshing{animation:spin 1s linear infinite}
    .status-map-header .refresh-btn[disabled] .refresh-icon{opacity:0.6}
    /* Dark card header style to match other headers */
    .card-header-dark{background:var(--card-bg);color:var(--text);border-bottom:1px solid rgba(255,255,255,0.06)}
    /* Specific selector requested: style the third .card's first child (header) */
    div.card:nth-child(3) > div:nth-child(1) {
      background: var(--card-bg) !important;
      color: var(--text) !important;
      border-bottom: 1px solid rgba(255,255,255,0.06) !important;
    }
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
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
                  <a className="nav-link" href="#about">
                    About
                  </a>
                </li>
              </ul>
              <div className="d-flex align-items-center gap-2">
                {user && (
                  <>
                    <span className="text-white small d-none d-md-inline">
                      {(user as any)?.attributes?.email ||
                        (user as any)?.username}
                    </span>
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

      <main
        className="flex-grow-1 py-4"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="h5 mb-0 text-primary">Admin Panel</h1>
          </div>

          {/* Device Status Map (moved to top) */}
          <div id="devices" className="card admin-card-shadow mb-3">
            <div className="card-header d-flex justify-content-between align-items-center status-map-header">
              <div>
                <strong>Device Status Map</strong>
                <div className="small ms-2 d-inline-block">
                  &nbsp;&nbsp;
                  <span className="status-count">{onlineCount}</span> Online •{" "}
                  <span className="status-count">{offlineCount}</span> Offline
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light text-dark refresh-btn"
                  onClick={refreshStatusMap}
                  disabled={isRefreshing}
                  title={isRefreshing ? "Refreshing…" : "Refresh device status"}
                >
                  <span
                    className={
                      "refresh-icon" + (isRefreshing ? " refreshing" : "")
                    }
                  >
                    <i className="fa fa-sync" aria-hidden="true" />
                  </span>
                  <span className="d-none d-sm-inline">
                    {isRefreshing ? "Refreshing…" : "Refresh"}
                  </span>
                </button>
              </div>
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

          {/* Top 5 highest speeds by plate */}
          <div className="card mb-3">
            <div className="card-header card-header-dark">
              Top 5 Speeds (by plate)
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Plate</th>
                      <th>Speed</th>
                      <th>Device</th>
                      <th>Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSpeeds.length > 0 ? (
                      topSpeeds.map((s) => (
                        <tr key={`${s.plate}-${s.device_id}`}>
                          <td>{s.plate}</td>
                          <td>{s.speed}</td>
                          <td>{s.device_id}</td>
                          <td className="small text-muted">
                            {s.ts ? new Date(s.ts).toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-muted small">
                          No speed data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Charts: daily, monthly, yearly */}
          <div className="row g-3 mb-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header card-header-dark">
                  Daily online devices (last 7 days)
                </div>
                <div className="card-body" style={{ height: 240 }}>
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
              <div className="card">
                <div className="card-header card-header-dark">
                  Monthly online devices (last 12 months)
                </div>
                <div className="card-body" style={{ height: 240 }}>
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
              <div className="card">
                <div className="card-header card-header-dark">
                  Yearly online devices (last 3 years)
                </div>
                <div className="card-body" style={{ height: 240 }}>
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
          </div>

          {/* Device Status Map duplicated block removed (moved above) */}
        </div>
      </main>

      <section
        className="py-4 border-top mt-auto"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        <div className="container text-center small text-muted">
          Admin section
        </div>
      </section>
    </div>
  );
}
