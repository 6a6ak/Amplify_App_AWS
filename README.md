
## Table of Contents

<ul style="list-style: none; padding-left: 0;">
	<li style="margin-bottom: 12px;"><img src="https://img.icons8.com/ios-filled/32/search--v1.png" width="32" style="vertical-align:middle;"/> <a href="#overview" style="font-size: 1.35em; color: #ff9800; font-weight: 600; vertical-align:middle; text-decoration: none;">Overview</a></li>
	<li style="margin-bottom: 12px;"><img src="https://img.icons8.com/color/32/chip.png" width="32" style="vertical-align:middle;"/> <a href="#hardware" style="font-size: 1.35em; color: #ff9800; font-weight: 600; vertical-align:middle; text-decoration: none;">Hardware</a></li>
	<li style="margin-bottom: 12px;"><img src="https://img.icons8.com/ios-filled/32/cloud.png" width="32" style="vertical-align:middle;"/> <a href="#aws-architecture" style="font-size: 1.35em; color: #ff9800; font-weight: 600; vertical-align:middle; text-decoration: none;">AWS Architecture</a></li>
	<li style="margin-bottom: 12px;"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="32" style="vertical-align:middle;"/> <a href="#web-application" style="font-size: 1.35em; color: #ff9800; font-weight: 600; vertical-align:middle; text-decoration: none;">Web Application</a></li>
	<li style="margin-bottom: 12px;"><img src="https://img.icons8.com/ios-filled/32/lock-2.png" width="32" style="vertical-align:middle;"/> <a href="#security" style="font-size: 1.35em; color: #ff9800; font-weight: 600; vertical-align:middle; text-decoration: none;">Security</a></li>
	<li style="margin-bottom: 12px;"><img src="https://img.icons8.com/ios-filled/32/combo-chart.png" width="32" style="vertical-align:middle;"/> <a href="#monitoring--logging" style="font-size: 1.35em; color: #ff9800; font-weight: 600; vertical-align:middle; text-decoration: none;">Monitoring & Logging</a></li>
	<li style="margin-bottom: 12px;"><img src="https://img.icons8.com/ios-filled/32/merge-git.png" width="32" style="vertical-align:middle;"/> <a href="#data-flow" style="font-size: 1.35em; color: #ff9800; font-weight: 600; vertical-align:middle; text-decoration: none;">Data Flow</a></li>
	<li style="margin-bottom: 12px;"><img src="https://img.icons8.com/ios-filled/32/rocket--v1.png" width="32" style="vertical-align:middle;"/> <a href="#getting-started" style="font-size: 1.35em; color: #ff9800; font-weight: 600; vertical-align:middle; text-decoration: none;">Getting Started</a></li>
	<li style="margin-bottom: 12px;"><img src="https://img.icons8.com/ios-filled/32/law.png" width="32" style="vertical-align:middle;"/> <a href="#license" style="font-size: 1.35em; color: #ff9800; font-weight: 600; vertical-align:middle; text-decoration: none;">License</a></li>
</ul>

---


---

## 🔎 Overview

A secure IoT system for monitoring car speeds on a street using ESP32/ESP8266 devices and AWS cloud services. The system detects vehicle movement using ultrasonic sensors, calculates speed, generates sample plate numbers, and logs data for analysis.

---

## 🔧 Hardware

**Ultrasonic Sensors**
> Detect vehicle movement between two fixed points.

**ESP32 / ESP8266**
> Calculates speed, generates plate IDs, and publishes MQTT messages.

---

## ☁️ AWS Architecture

**AWS IoT Core**
> Secure MQTT messaging channel

**Topics used:**
`telemetry`, `status`, `deadlink`

**Lambda**
> Processes messages and triggers storage actions

**DynamoDB**
> Stores JSON-based speed and plate data

**S3 Bucket**
> Stores raw data for archival and analysis

**API Gateway**
> Provides REST interface for frontend access

**Cognito**
> Authentication for admin dashboard usage

**IAM**
> Role-based access control for all resources

**CloudWatch**
> Logs, metrics, alarms

**CloudTrail & AWS Config**
> Compliance and configuration tracking

---

## 💻 Web Application

<span style="display: flex; align-items: center; gap: 10px;">
	<img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="32" style="vertical-align:middle;" alt="React Logo"/>
	<span style="font-size: 1.1em; font-weight: 600; color: #61dafb;">Built with React</span>
</span>



Modern, responsive frontend for administrators to view logs and system insights.

**AWS Amplify Deployment**
> Managed deployment and hosting. Automatic updates on `release` branch push.

---

## 🔒 Security

**Encrypted Connections**
> MQTT secured with device certificates.

**IAM & Cognito**
> Strict IAM roles and Cognito authentication for admin tools.

**Controlled Access**
> Limited database and storage permissions.

---

## 📊 Monitoring and Logging

**CloudWatch**
> Logs and real-time metrics.

**CloudTrail**
> Auditing changes and API activity.

**AWS Config**
> Configuration compliance tracking.

---

## 🔀 Data Flow

**Detection & Speed Calculation**
> Sensor detects a vehicle and calculates speed.

**MQTT Telemetry**
> Telemetry is sent over MQTT to AWS IoT Core.

**Lambda Processing**
> IoT Core triggers Lambda for processing.

**Data Storage**
> Data stored in DynamoDB and backed up in S3.

**Admin UI Access**
> Admin UI retrieves data via API Gateway.

**Access Validation**
> Cognito validates access permissions.

---

## 🚀 Getting Started

1. Clone the repository
2. Create AWS IoT Core resources and download certificates
3. Set up DynamoDB, Lambda, S3, API Gateway, Cognito, and CloudWatch
4. Flash firmware code to ESP32/ESP8266 boards
5. Configure WiFi and MQTT certificates on the devices
6. Deploy the web interface with Amplify and connect to GitHub

---

## ⚖️ License
MIT License. See LICENSE file for details.
