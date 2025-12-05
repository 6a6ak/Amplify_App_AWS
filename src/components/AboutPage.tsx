import React from "react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark admin-gradient fixed-top">
        <div className="container">
          <Link
            className="navbar-brand fw-semibold d-flex align-items-center"
            to="/"
          >
            <i className="fa fa-car me-2" aria-hidden="true" />
            Speed Meter
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
      <main
        className="flex-grow-1"
        style={{ backgroundColor: "var(--bg)", paddingTop: 80 }}
      >
        <div
          className="w-100 text-white"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1rem" }}
        >
          <h2>Car Speed Logging System</h2>
          <p>
            A secure IoT system for monitoring car speeds on a street using
            ESP32/ESP8266 devices and AWS cloud services. The system detects
            vehicle movement using ultrasonic sensors, calculates speed,
            generates sample plate numbers, and logs data for analysis.
          </p>
          <hr />
          <h3>Table of Contents</h3>
          <ul className="list-unstyled mb-4">
            <li>
              <a
                className="btn btn-link text-white w-100 text-start mb-2 ps-0"
                href="#overview"
              >
                <i className="fa fa-info-circle me-2" aria-hidden="true" />
                Overview
              </a>
            </li>
            <li>
              <a
                className="btn btn-link text-white w-100 text-start mb-2 ps-0"
                href="#hardware"
              >
                <i className="fa fa-microchip me-2" aria-hidden="true" />
                Hardware
              </a>
            </li>
            <li>
              <a
                className="btn btn-link text-white w-100 text-start mb-2 ps-0"
                href="#aws-architecture"
              >
                <i className="fa fa-cloud me-2" aria-hidden="true" />
                AWS Architecture
              </a>
            </li>
            <li>
              <a
                className="btn btn-link text-white w-100 text-start mb-2 ps-0"
                href="#web-application"
              >
                <i className="fa fa-desktop me-2" aria-hidden="true" />
                Web Application
              </a>
            </li>
            <li>
              <a
                className="btn btn-link text-white w-100 text-start mb-2 ps-0"
                href="#security"
              >
                <i className="fa fa-lock me-2" aria-hidden="true" />
                Security
              </a>
            </li>
            <li>
              <a
                className="btn btn-link text-white w-100 text-start mb-2 ps-0"
                href="#monitoring-and-logging"
              >
                <i className="fa fa-chart-line me-2" aria-hidden="true" />
                Monitoring &amp; Logging
              </a>
            </li>
            <li>
              <a
                className="btn btn-link text-white w-100 text-start mb-2 ps-0"
                href="#data-flow"
              >
                <i className="fa fa-random me-2" aria-hidden="true" />
                Data Flow
              </a>
            </li>
            <li>
              <a
                className="btn btn-link text-white w-100 text-start mb-2 ps-0"
                href="#getting-started"
              >
                <i className="fa fa-play-circle me-2" aria-hidden="true" />
                Getting Started
              </a>
            </li>
            <li>
              <a
                className="btn btn-link text-white w-100 text-start ps-0"
                href="#license"
              >
                <i className="fa fa-balance-scale me-2" aria-hidden="true" />
                License
              </a>
            </li>
          </ul>
          <hr />
          <h3 id="overview">Overview</h3>
          <p>
            This project uses two ultrasonic sensors to estimate vehicle speed
            based on time and distance. Each event is enriched with a randomly
            generated license plate number before being transmitted to AWS IoT
            Core over secure MQTT. Incoming telemetry is processed by Lambda
            functions, stored in DynamoDB, and optionally backed up in S3.
            System activity and performance are monitored with AWS CloudWatch,
            CloudTrail, and AWS Config.
          </p>
          <hr />
          <h3 id="hardware">Hardware</h3>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-bullseye me-2" aria-hidden="true" />
                    Ultrasonic Sensors
                  </h5>
                  <p className="card-text mb-0">
                    Detect vehicle movement between two fixed points.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-microchip me-2" aria-hidden="true" />
                    ESP32 / ESP8266
                  </h5>
                  <p className="card-text mb-0">
                    Calculates speed, generates plate IDs, and publishes MQTT
                    messages.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <h3 id="aws-architecture">AWS Architecture</h3>
          <ul>
            <li>
              <strong>AWS IoT Core</strong> – Secure MQTT messaging channel
              <br />
              Topics used:
              <ul>
                <li>
                  <code>telemetry</code>
                </li>
                <li>
                  <code>status</code>
                </li>
                <li>
                  <code>deadlink</code>
                </li>
              </ul>
            </li>
            <li>
              <strong>Lambda</strong> – Processes messages and triggers storage
              actions
            </li>
            <li>
              <strong>DynamoDB</strong> – Stores JSON-based speed and plate data
            </li>
            <li>
              <strong>S3 Bucket</strong> – Stores raw data for archival and
              analysis
            </li>
            <li>
              <strong>API Gateway</strong> – Provides REST interface for
              frontend access
            </li>
            <li>
              <strong>Cognito</strong> – Authentication for admin dashboard
              usage
            </li>
            <li>
              <strong>IAM</strong> – Role-based access control for all resources
            </li>
            <li>
              <strong>CloudWatch</strong> – Logs, metrics, alarms
            </li>
            <li>
              <strong>CloudTrail & AWS Config</strong> – Compliance and
              configuration tracking
            </li>
          </ul>
          <hr />
          <h3 id="web-application">Web Application</h3>
          <ul>
            <li>
              Developed using <strong>React</strong>
            </li>
            <li>Displays logs and system insights for administrators</li>
            <li>
              Managed and deployed with <strong>AWS Amplify</strong>
            </li>
            <li>
              Automatic deployment triggered by updates on the{" "}
              <code>release</code> branch
            </li>
          </ul>
          <hr />
          <h3 id="security">Security</h3>
          <ul>
            <li>Encrypted MQTT connections using device certificates</li>
            <li>Strict IAM role access to databases and storage</li>
            <li>Authenticated access via Cognito for management tools</li>
          </ul>
          <hr />
          <h3 id="monitoring-and-logging">Monitoring and Logging</h3>
          <ul>
            <li>CloudWatch for logs and real-time metrics</li>
            <li>CloudTrail for auditing changes and API activity</li>
            <li>AWS Config for configuration compliance</li>
          </ul>
          <hr />
          <h3 id="data-flow">Data Flow</h3>
          <ol>
            <li>Sensor detects a vehicle and calculates speed</li>
            <li>Telemetry is sent over MQTT to AWS IoT Core</li>
            <li>IoT Core triggers Lambda for processing</li>
            <li>Data stored in DynamoDB and backed up in S3</li>
            <li>Admin UI retrieves data via API Gateway</li>
            <li>Cognito validates access permissions</li>
          </ol>
          <hr />
          <h3 id="getting-started">Getting Started</h3>
          <ol>
            <li>Clone the repository</li>
            <li>Create AWS IoT Core resources and download certificates</li>
            <li>
              Set up DynamoDB, Lambda, S3, API Gateway, Cognito, and CloudWatch
            </li>
            <li>Flash ESP firmware code to ESP32/ESP8266 boards</li>
            <li>Configure WiFi and MQTT certificates on the devices</li>
            <li>Deploy the web interface with Amplify connected to GitHub</li>
          </ol>
          <hr />
          <h3 id="license">License</h3>
          <p>MIT License. See repository for details.</p>
        </div>
      </main>
      <footer className="py-4 border-top mt-auto bg-dark">
        <div className="container text-center small text-muted">
          &copy; {new Date().getFullYear()} Speed Meter Project
        </div>
      </footer>
    </div>
  );
}
