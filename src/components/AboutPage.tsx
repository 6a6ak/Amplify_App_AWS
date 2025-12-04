import React from "react";
import { Link } from "react-router-dom";

export default function AboutPage() {
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
                  <Link className="nav-link" to="/devices">
                    Devices
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link active" to="/about">
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
          <div className="card shadow-sm">
            <div
              className="card-header"
              style={{ backgroundColor: "var(--card-bg)" }}
            >
              <h2 className="h6 mb-0">About This Project</h2>
            </div>
            <div className="card-body">
              <p>
                This is a demo application that shows telemetry collected from
                roadside sensor devices (ESP32). The Admin panel provides charts
                and a device status map. The Devices pages list individual
                devices and allow inspection of recent telemetry.
              </p>
              <p>
                The application uses React + Vite on the frontend and a small
                Node.js backend for local development. Charts are rendered with
                Chart.js.
              </p>
              <p className="text-muted small">Version: sample / demo</p>
            </div>
          </div>
        </div>
      </main>

      <section
        className="py-4 border-top mt-auto"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        <div className="container text-center small text-muted">
          About section
        </div>
      </section>
    </div>
  );
}
