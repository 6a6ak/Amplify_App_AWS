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
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-cloud me-2" aria-hidden="true" />
                    AWS IoT Core
                  </h5>
                  <p className="card-text mb-1">
                    Secure MQTT messaging channel
                  </p>
                  <div>
                    <span className="fw-semibold">Topics used:</span>
                    <ul className="mb-0">
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
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-lambda me-2" aria-hidden="true" />
                    Lambda
                  </h5>
                  <p className="card-text mb-0">
                    Processes messages and triggers storage actions
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-dark text-white h-100 shadow-sm mt-4">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-database me-2" aria-hidden="true" />
                    DynamoDB
                  </h5>
                  <p className="card-text mb-0">
                    Stores JSON-based speed and plate data
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-dark text-white h-100 shadow-sm mt-4">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-archive me-2" aria-hidden="true" />
                    S3 Bucket
                  </h5>
                  <p className="card-text mb-0">
                    Stores raw data for archival and analysis
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-dark text-white h-100 shadow-sm mt-4">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-plug me-2" aria-hidden="true" />
                    API Gateway
                  </h5>
                  <p className="card-text mb-0">
                    Provides REST interface for frontend access
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-dark text-white h-100 shadow-sm mt-4">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-user-shield me-2" aria-hidden="true" />
                    Cognito
                  </h5>
                  <p className="card-text mb-0">
                    Authentication for admin dashboard usage
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-dark text-white h-100 shadow-sm mt-4">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-id-badge me-2" aria-hidden="true" />
                    IAM
                  </h5>
                  <p className="card-text mb-0">
                    Role-based access control for all resources
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-dark text-white h-100 shadow-sm mt-4">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-chart-bar me-2" aria-hidden="true" />
                    CloudWatch
                  </h5>
                  <p className="card-text mb-0">Logs, metrics, alarms</p>
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="card bg-dark text-white h-100 shadow-sm mt-4">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-shield-alt me-2" aria-hidden="true" />
                    CloudTrail &amp; AWS Config
                  </h5>
                  <p className="card-text mb-0">
                    Compliance and configuration tracking
                  </p>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <h3 id="web-application">Web Application</h3>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title d-flex align-items-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
                      alt="React Logo"
                      style={{ width: 28, height: 28, marginRight: 8 }}
                    />
                    Built with React
                  </h5>
                  <p className="card-text mb-0">
                    Modern, responsive frontend for administrators to view logs
                    and system insights.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-rocket me-2" aria-hidden="true" />
                    AWS Amplify Deployment
                  </h5>
                  <p className="card-text mb-0">
                    Managed deployment and hosting. Automatic updates on{" "}
                    <code>release</code> branch push.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <h3 id="security">Security</h3>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-lock me-2" aria-hidden="true" />
                    Encrypted Connections
                  </h5>
                  <p className="card-text mb-0">
                    MQTT secured with device certificates.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-user-shield me-2" aria-hidden="true" />
                    IAM &amp; Cognito
                  </h5>
                  <p className="card-text mb-0">
                    Strict IAM roles and Cognito authentication for admin tools.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-database me-2" aria-hidden="true" />
                    Controlled Access
                  </h5>
                  <p className="card-text mb-0">
                    Limited database and storage permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <h3 id="monitoring-and-logging">Monitoring and Logging</h3>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-chart-line me-2" aria-hidden="true" />
                    CloudWatch
                  </h5>
                  <p className="card-text mb-0">Logs and real-time metrics.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-shield-alt me-2" aria-hidden="true" />
                    CloudTrail
                  </h5>
                  <p className="card-text mb-0">
                    Auditing changes and API activity.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-cogs me-2" aria-hidden="true" />
                    AWS Config
                  </h5>
                  <p className="card-text mb-0">
                    Configuration compliance tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <h3 id="data-flow">Data Flow</h3>
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-car-side me-2" aria-hidden="true" />
                    Detection & Speed Calculation
                  </h5>
                  <p className="card-text mb-0">
                    Sensor detects a vehicle and calculates speed.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-paper-plane me-2" aria-hidden="true" />
                    MQTT Telemetry
                  </h5>
                  <p className="card-text mb-0">
                    Telemetry is sent over MQTT to AWS IoT Core.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-lambda me-2" aria-hidden="true" />
                    Lambda Processing
                  </h5>
                  <p className="card-text mb-0">
                    IoT Core triggers Lambda for processing.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100 shadow-sm mt-4">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-database me-2" aria-hidden="true" />
                    Data Storage
                  </h5>
                  <p className="card-text mb-0">
                    Data stored in DynamoDB and backed up in S3.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100 shadow-sm mt-4">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-desktop me-2" aria-hidden="true" />
                    Admin UI Access
                  </h5>
                  <p className="card-text mb-0">
                    Admin UI retrieves data via API Gateway.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white h-100 shadow-sm mt-4">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fa fa-user-shield me-2" aria-hidden="true" />
                    Access Validation
                  </h5>
                  <p className="card-text mb-0">
                    Cognito validates access permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <br />
          <hr />
        </div>
      </main>
    </div>
  );
}
