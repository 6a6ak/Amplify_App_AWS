

## Table of Contents




[<img src="https://img.shields.io/badge/%F0%9F%9F%A0%20Overview-23272f?style=for-the-badge&labelColor=23272f&color=23272f" alt="Overview"/>](#overview)

[<img src="https://img.shields.io/badge/%F0%9F%9F%A0%20Hardware-23272f?style=for-the-badge&labelColor=23272f&color=23272f" alt="Hardware"/>](#hardware)

[<img src="https://img.shields.io/badge/%F0%9F%9F%A0%20AWS%20Architecture-23272f?style=for-the-badge&labelColor=23272f&color=23272f" alt="AWS Architecture"/>](#aws-architecture)

[<img src="https://img.shields.io/badge/%F0%9F%9F%A0%20Web%20Application-23272f?style=for-the-badge&labelColor=23272f&color=23272f" alt="Web Application"/>](#web-application)

[<img src="https://img.shields.io/badge/%F0%9F%9F%A0%20Security-23272f?style=for-the-badge&labelColor=23272f&color=23272f" alt="Security"/>](#security)

[<img src="https://img.shields.io/badge/%F0%9F%9F%A0%20Monitoring--Logging-23272f?style=for-the-badge&labelColor=23272f&color=23272f" alt="Monitoring & Logging"/>](#monitoring--logging)

[<img src="https://img.shields.io/badge/%F0%9F%9F%A0%20Data%20Flow-23272f?style=for-the-badge&labelColor=23272f&color=23272f" alt="Data Flow"/>](#data-flow)

[<img src="https://img.shields.io/badge/%F0%9F%9F%A0%20Getting%20Started-23272f?style=for-the-badge&labelColor=23272f&color=23272f" alt="Getting Started"/>](#getting-started)

[<img src="https://img.shields.io/badge/%F0%9F%9F%A0%20License-23272f?style=for-the-badge&labelColor=23272f&color=23272f" alt="License"/>](#license)

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


## 📸 Screenshots

> *(Screenshots will be added here later by the developer)*

**1. IoT Core – Connected Device Status**

![Projects Homepage](./readme/frontend01.PNG)

![Projects Homepage](./readme/frontend01.PNG)

![Projects Homepage](./readme/frontend01.PNG)

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
MIT License. See [License](./LICENSE) file for details.
